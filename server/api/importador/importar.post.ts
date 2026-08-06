import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { db } from '~/server/database'
import { concursos } from '~/server/database/schema'
import { and, eq } from 'drizzle-orm'
import { handleDatabaseError } from '~/server/utils/errorHandler'
import * as XLSX from 'xlsx'

interface ParsedRow {
  numeroConcurso: number
  dataSorteio: string
  numeros: number[]
}

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado.' })
  }

  const fileField = formData.find(f => f.name === 'arquivo')
  const tipoField = formData.find(f => f.name === 'tipoLoteria')

  if (!fileField || !fileField.data) {
    throw createError({ statusCode: 422, statusMessage: 'Selecione um arquivo para importar.' })
  }

  const tipoLoteria = tipoField?.data?.toString() || 'lotofacil'
  if (!['lotofacil', 'lotomania'].includes(tipoLoteria)) {
    throw createError({ statusCode: 422, statusMessage: 'Tipo de loteria inválido.' })
  }

  // Validate file size (15MB max)
  if (fileField.data.length > 15 * 1024 * 1024) {
    throw createError({ statusCode: 422, statusMessage: 'O arquivo deve ter no máximo 15MB.' })
  }

  // Detect file type
  const filename = (fileField.filename || '').toLowerCase()
  const isExcel = filename.endsWith('.xls') || filename.endsWith('.xlsx')
  const isCsv = filename.endsWith('.csv') || (!isExcel && !filename.includes('.'))

  if (!isCsv && !isExcel) {
    throw createError({ statusCode: 422, statusMessage: 'Formato não suportado. Use CSV, XLS ou XLSX.' })
  }

  const quantidadeNumeros = tipoLoteria === 'lotofacil' ? 15 : 20
  let rows: string[][]

  if (isExcel) {
    // Check if the file is actually HTML disguised as XLS/XLSX (common with Caixa downloads)
    const fileStart = fileField.data.slice(0, 100).toString('utf-8').trim().toLowerCase()
    if (fileStart.startsWith('<') || fileStart.startsWith('<!doctype') || fileStart.includes('<html') || fileStart.includes('<table')) {
      rows = parseHtmlTable(fileField.data.toString('utf-8'))
    } else {
      rows = parseExcel(fileField.data)
    }
  } else {
    rows = parseCsv(fileField.data.toString('utf-8'))
  }

  if (rows.length < 1) {
    throw createError({ statusCode: 422, statusMessage: `Arquivo vazio ou com formato inválido. Nenhuma linha com dados encontrada.` })
  }

  // Check if first row is header
  const firstRow = rows[0] || []
  const firstValue = (firstRow[0] || '').replace(/[^0-9]/g, '')
  const hasHeader = firstValue === '' || isNaN(Number(firstValue)) || Number(firstValue) === 0
  const startIndex = hasHeader ? 1 : 0

  // Auto-detect column layout: find which column has the contest number
  let concursoCol = 0
  let dataCol = 1
  let numerosStartCol = 2

  // If header exists, try to detect columns from header names
  if (hasHeader && firstRow.length > 0) {
    for (let i = 0; i < firstRow.length; i++) {
      const col = (firstRow[i] || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (col.includes('concurso') || col.includes('sorteio') && col.includes('num')) {
        concursoCol = i
      } else if (col.includes('data')) {
        dataCol = i
      } else if (col.includes('bola') || col.includes('dezena') || col.includes('numero')) {
        if (numerosStartCol === 2 || i < numerosStartCol) {
          numerosStartCol = i
        }
      }
    }
  }

  // If no header detection worked, try to auto-detect from first data row
  if (!hasHeader || numerosStartCol === 2) {
    const sampleRow = rows[startIndex] || []
    // Find first column that looks like a sequence of small numbers (drawn numbers)
    for (let i = 2; i < Math.min(sampleRow.length, 10); i++) {
      const val = parseInt((sampleRow[i] || '').toString().replace(/[^0-9]/g, ''), 10)
      if (!isNaN(val) && val >= 0 && val <= 99) {
        numerosStartCol = i
        break
      }
    }
  }

  let importados = 0
  let duplicados = 0
  let erros = 0

  try {
    for (let i = startIndex; i < rows.length; i++) {
      const cols = rows[i] || []

      if (cols.length < numerosStartCol + 1) {
        erros++
        continue
      }

      // Column for contest number (auto-detected)
      const numeroConcurso = parseInt((cols[concursoCol] || '').toString().replace(/[^0-9]/g, ''), 10)
      if (!numeroConcurso || numeroConcurso <= 0) {
        erros++
        continue
      }

      // Column for draw date (auto-detected)
      const dataSorteio = parseDate((cols[dataCol] || '').toString())
      if (!dataSorteio) {
        erros++
        continue
      }

      // Columns for drawn numbers (auto-detected start)
      const numeros: number[] = []
      for (let col = numerosStartCol; col < cols.length && numeros.length < quantidadeNumeros; col++) {
        const val = (cols[col] || '').toString().replace(/[^0-9]/g, '')
        if (val && val.length <= 2) {
          const num = parseInt(val, 10)
          if (!isNaN(num) && !numeros.includes(num)) {
            if (tipoLoteria === 'lotofacil' && num >= 1 && num <= 25) {
              numeros.push(num)
            } else if (tipoLoteria === 'lotomania' && num >= 0 && num <= 99) {
              numeros.push(num)
            }
          }
        }
      }

      if (numeros.length < quantidadeNumeros) {
        erros++
        continue
      }

      numeros.sort((a, b) => a - b)

      // Check duplicate
      const existing = await db
        .select({ id: concursos.id })
        .from(concursos)
        .where(and(eq(concursos.numeroConcurso, numeroConcurso), eq(concursos.tipoLoteria, tipoLoteria)))
        .limit(1)

      if (existing.length > 0) {
        duplicados++
        continue
      }

      await db.insert(concursos).values({
        numeroConcurso,
        tipoLoteria,
        dataSorteio,
        numerosSorteados: numeros,
        premioPrincipal: '0',
        acumulou: false,
        valorAcumulado: '0',
      })

      importados++
    }

    return {
      data: {
        importados,
        duplicados,
        erros,
        totalLinhas: rows.length - startIndex,
      },
      message: `Importação concluída! ${importados} concursos importados, ${duplicados} duplicados, ${erros} erros.`,
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})

/**
 * Parseia conteúdo CSV em matriz de strings.
 */
function parseCsv(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter(line => line.trim())

  if (lines.length === 0) return []

  // Detect delimiter
  const firstLine = lines[0] || ''
  const delimiter = firstLine.split(',').length > firstLine.split(';').length ? ',' : ';'

  return lines.map(line => line.split(delimiter).map(c => c.trim()))
}

/**
 * Parseia arquivo Excel (XLS/XLSX) em matriz de strings.
 */
function parseExcel(buffer: Buffer): string[][] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })

  // Tentar cada aba até encontrar dados válidos
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue

    // Converter para array de arrays
    const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      dateNF: 'dd/mm/yyyy',
      defval: '',
    })

    // Filtrar linhas completamente vazias
    const rows = data
      .filter((row) => row && row.length > 0 && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== ''))
      .map((row) => row.map((cell) => {
        if (cell === null || cell === undefined) return ''
        if (cell instanceof Date) {
          const d = cell
          const day = String(d.getDate()).padStart(2, '0')
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const year = d.getFullYear()
          return `${day}/${month}/${year}`
        }
        return String(cell).trim()
      }))

    // Se encontrou pelo menos 2 linhas com dados, usar esta aba
    if (rows.length >= 2) {
      return rows
    }
  }

  // Fallback: retornar dados da primeira aba mesmo que vazia
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return []

  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return []

  const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    dateNF: 'dd/mm/yyyy',
    defval: '',
  })

  return data
    .filter((row) => row && row.length > 0 && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== ''))
    .map((row) => row.map((cell) => {
      if (cell === null || cell === undefined) return ''
      if (cell instanceof Date) {
        const d = cell
        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const year = d.getFullYear()
        return `${day}/${month}/${year}`
      }
      return String(cell).trim()
    }))
}

/**
 * Parseia tabela HTML (arquivos da Caixa que são HTML disfarçados de XLS/XLSX).
 */
function parseHtmlTable(html: string): string[][] {
  const rows: string[][] = []

  // Extrair todas as linhas <tr>...</tr>
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let trMatch: RegExpExecArray | null

  while ((trMatch = trRegex.exec(html)) !== null) {
    const trContent = trMatch[1]
    const cells: string[] = []

    // Extrair células <td> ou <th>
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi
    let cellMatch: RegExpExecArray | null

    while ((cellMatch = cellRegex.exec(trContent)) !== null) {
      // Remover tags HTML internas e decodificar entidades básicas
      let cellValue = cellMatch[1]
        .replace(/<[^>]+>/g, '') // Remove tags HTML
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
        .trim()

      cells.push(cellValue)
    }

    // Só adicionar linhas que têm pelo menos uma célula com conteúdo
    if (cells.length > 0 && cells.some(c => c !== '')) {
      rows.push(cells)
    }
  }

  return rows
}

/**
 * Parseia data em diversos formatos para yyyy-mm-dd.
 */
function parseDate(value: string): string | null {
  if (!value) return null

  // dd/mm/yyyy ou dd-mm-yyyy ou dd.mm.yyyy
  const brMatch = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/)
  if (brMatch) {
    const [, day, month, year] = brMatch
    const fullYear = (year || '').length === 2 ? `20${year}` : year
    return `${fullYear}-${(month || '').padStart(2, '0')}-${(day || '').padStart(2, '0')}`
  }

  // yyyy-mm-dd
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) return value

  // mm/dd/yyyy (fallback para Excel em inglês)
  const usMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (usMatch) {
    const [, month, day, year] = usMatch
    const m = parseInt(month || '0', 10)
    const d = parseInt(day || '0', 10)
    // Se mês > 12, assume formato br
    if (m > 12) {
      return `${year}-${(day || '').padStart(2, '0')}-${(month || '').padStart(2, '0')}`
    }
    // Assume BR por padrão (dd/mm/yyyy)
    return `${year}-${(month || '').padStart(2, '0')}-${(day || '').padStart(2, '0')}`
  }

  return null
}
