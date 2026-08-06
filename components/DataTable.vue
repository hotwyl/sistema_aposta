<script setup lang="ts" generic="T">
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useVueTable,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from '@tanstack/vue-table'
import { ref, computed, watch } from 'vue'

interface Props {
  data: T[]
  columns: ColumnDef<T, any>[]
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: string
  striped?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  searchable: true,
  searchPlaceholder: 'Buscar...',
  loading: false,
  emptyMessage: 'Nenhum registro encontrado.',
  emptyIcon: 'fa-inbox',
  striped: false,
  compact: false,
})

const emit = defineEmits<{
  rowClick: [row: T]
}>()

const sorting = ref<SortingState>([])
const globalFilter = ref('')
const pagination = ref<PaginationState>({
  pageIndex: 0,
  pageSize: props.pageSize,
})

watch(() => props.pageSize, (val) => {
  pagination.value.pageSize = val
})

// Reset page when filter changes
watch(globalFilter, () => {
  pagination.value.pageIndex = 0
})

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  state: {
    get sorting() { return sorting.value },
    get globalFilter() { return globalFilter.value },
    get pagination() { return pagination.value },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})

const pageInfo = computed(() => {
  const { pageIndex, pageSize } = pagination.value
  const total = table.getFilteredRowModel().rows.length
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)
  return { from, to, total }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Search -->
    <div v-if="searchable" class="relative">
      <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
      <input
        v-model="globalFilter"
        type="text"
        :placeholder="searchPlaceholder"
        class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
      />
      <button
        v-if="globalFilter"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        @click="globalFilter = ''"
        aria-label="Limpar busca"
      >
        <i class="fas fa-times text-sm"></i>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <i class="fas fa-spinner fa-spin text-2xl text-primary-500"></i>
      <span class="ml-3 text-gray-500 dark:text-gray-400">Carregando...</span>
    </div>

    <!-- Table -->
    <div v-else-if="data.length > 0" class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table class="w-full text-sm" role="table">
        <thead class="bg-gray-50/80 dark:bg-gray-700/50">
          <tr>
            <th
              v-for="header in table.getFlatHeaders()"
              :key="header.id"
              scope="col"
              class="px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none"
              :class="[
                compact ? 'py-2.5' : 'py-3.5',
                header.column.getCanSort() ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors' : '',
              ]"
              :style="{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined }"
              @click="header.column.getToggleSortingHandler()?.($event)"
            >
              <div class="flex items-center gap-1.5">
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                <template v-if="header.column.getCanSort()">
                  <i
                    v-if="header.column.getIsSorted() === 'asc'"
                    class="fas fa-sort-up text-primary-500"
                  ></i>
                  <i
                    v-else-if="header.column.getIsSorted() === 'desc'"
                    class="fas fa-sort-down text-primary-500"
                  ></i>
                  <i
                    v-else
                    class="fas fa-sort text-gray-300 dark:text-gray-600"
                  ></i>
                </template>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
          <tr
            v-for="(row, idx) in table.getRowModel().rows"
            :key="row.id"
            class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
            :class="[
              striped && idx % 2 === 1 ? 'bg-gray-25 dark:bg-gray-800/30' : '',
            ]"
            @click="emit('rowClick', row.original)"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="compact ? 'px-4 py-2' : 'px-4 py-3.5'"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div v-else class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
      <i :class="`fas ${emptyIcon} text-4xl mb-3`"></i>
      <p class="text-sm">{{ emptyMessage }}</p>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && data.length > 0 && table.getPageCount() > 1"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2"
    >
      <span class="text-xs text-gray-500 dark:text-gray-400">
        Mostrando {{ pageInfo.from }}–{{ pageInfo.to }} de {{ pageInfo.total }} registros
      </span>

      <div class="flex items-center gap-1">
        <button
          class="px-2.5 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          :disabled="!table.getCanPreviousPage()"
          @click="table.firstPage()"
          aria-label="Primeira página"
        >
          <i class="fas fa-angles-left"></i>
        </button>
        <button
          class="px-2.5 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
          aria-label="Página anterior"
        >
          <i class="fas fa-angle-left"></i>
        </button>

        <span class="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
          {{ pagination.pageIndex + 1 }} / {{ table.getPageCount() }}
        </span>

        <button
          class="px-2.5 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
          aria-label="Próxima página"
        >
          <i class="fas fa-angle-right"></i>
        </button>
        <button
          class="px-2.5 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          :disabled="!table.getCanNextPage()"
          @click="table.lastPage()"
          aria-label="Última página"
        >
          <i class="fas fa-angles-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>
