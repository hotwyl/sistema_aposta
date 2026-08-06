import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { db } from '~/server/database'
import { apostas } from '~/server/database/schema'
import { handleDatabaseError } from '~/server/utils/errorHandler'
import * as XLSX from 'xlsx'

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
  const isCsv = filename.endsWith('.csv') || filename.endsWith('.txt') || (!isExcel && !filename.includes('.'))

  if (!isCsv && !isExcel) {
    throw createError({ statusCode: 422, statusMessage: 'Formato não suportado. Use CSV, XLS, XLSX ou TXT.' })
  }

  const quantidadeEsperada = tipoLoteria === 'lotofacil' ? 15 : 50
  const maxNumero = tipoLoteria === 'lotofacil' ? 25 : 99
  const minNumero = tipoLoteria === 'lotofacil' ? 1 : 0
  let rows: string[][]

  if (isExcel) {
    const fileStart = fileField.data.slice(0, 100).toString('utf-8').trim().toLowerCase()
    if (fileStart.startsWith('<') || fileStart.includes('<html') || fileStart.includes('<table')) {
      rows = parseHtmlTable(fileField.data.toString('utf-8'))
    } else {
      rows = parseExcel(fileField.data)
    }
  } else {
    rows = parseCsv(fileField.data.toString('utf-8'))
  }

  if (rows.length < 1) {
    throw createError({ statusCode: 422, statusMessage: 'Arquivo vazio ou com formato inválido.' })
  }

  // Detect if first row is header
  const firstRow = rows[0] || []
  const firstCellLower = (firstRow[0] || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const hasHeader = firstCellLower.includes('numero') || firstCellLower.includes('aposta')
    || firstCellLower.includes('jogo') || firstCellLower.includes('bola')
    || firstCellLower.includes('n1') || firstCellLower.includes('dezena')
    || isNaN(Number((firstRow[0] || '').replace(/[^0-9]/g, '')))
  const startIndex = hasHeader ? 1 : 0

  let importadas = 0
  let erros = 0

  try {
    for (let i = startIndex; i < rows.length; i++) {
      const cols = rows[i] || []
      if (cols.length < 1) {
        erros++
        continue
      }

      // Parse numbers from columns
      const numeros: number[] = []

      for (let col = 0; col < cols.length && numeros.length < quantidadeEsperada; col++) {
        const rawVal = (cols[col] || '').toString().trim()
        if (!rawVal) continue

        // Handle case where multiple numbers are in one cell (separated by - , ; or space)
        const parts = rawVal.split(/[-,;\s]+/).filter(p => p.trim())

        for (const part of parts) {
          const val = part.replace(/[^0-9]/g, '')
          if (val) {
            const num = parseInt(val, 10)
            if (!isNaN(num) && num >= minNumero && num <= maxNumero && !numeros.includes(num)) {
              numeros.push(num)
              if (numeros.length >= quantidadeEsperada) break
            }
          }
        }
      }

      // Validate number count
      if (tipoLoteria === 'lotofacil') {
        if (numeros.length < 15 || numeros.length > 20) {
          erros++
          continue
        }
      } else {
        if (numeros.length !== 50) {
          erros++
          continue
        }
      }

      numeros.sort((a, b) => a - b)

      // Insert the bet
      await db.insert(apostas).values({
        tipoLoteria,
        numeros,
        quantidadeNumeros: numeros.length,
        valorAposta: '0',
        isFavorita: false,
        observacoes: `Importada via arquivo`,
        dataAposta: null,
        concursoId: null,
      })

      importadas++
    }

    return {
      data: {
        importadas,
        erros,
        totalLinhas: rows.length - startIndex,
      },
      message: `Importação concluída! ${importadas} apostas importadas, ${erros} linhas com erro.`,
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

  const firstLine = lines[0] || ''
  const delimiter = firstLine.split(',').length > firstLine.split(';').length ? ',' : ';'

  return lines.map(line => line.split(delimiter).map(c => c.trim()))
}

/**
 * Parseia arquivo Excel (XLS/XLSX) em matriz de strings.
 */
function parseExcel(buffer: Buffer): string[][] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue

    const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: '',
    })

    const rows = data
      .filter((row) => row && row.length > 0 && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== ''))
      .map((row) => row.map((cell) => {
        if (cell === null || cell === undefined) return ''
        return String(cell).trim()
      }))

    if (rows.length >= 1) return rows
  }

  return []
}

/**
 * Parseia tabela HTML.
 */
function parseHtmlTable(html: string): string[][] {
  const rows: string[][] = []
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let trMatch: RegExpExecArray | null

  while ((trMatch = trRegex.exec(html)) !== null) {
    const trContent = trMatch[1]
    const cells: string[] = []
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi
    let cellMatch: RegExpExecArray | null

    while ((cellMatch = cellRegex.exec(trContent)) !== null) {
      let cellValue = cellMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
        .trim()
      cells.push(cellValue)
    }

    if (cells.length > 0 && cells.some(c => c !== '')) {
      rows.push(cells)
    }
  }

  return rows
}
