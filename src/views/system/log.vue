<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>操作日志</span>
      </div>
    </template>

    <el-form :inline="true" :model="query" class="search-form">
      <el-form-item label="操作人">
        <el-input v-model="query.operatorName" placeholder="操作人姓名" clearable />
      </el-form-item>
      <el-form-item label="模块">
        <el-input v-model="query.module" placeholder="模块名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData" max-height="60vh" border>
      <el-table-column prop="operatorName" label="操作人" width="140" />
      <el-table-column prop="module" label="模块" width="140" />
      <el-table-column prop="operation" label="操作名称" min-width="150" />
      <el-table-column prop="ip" label="IP 地址" width="140" />
      <el-table-column prop="createTime" label="创建时间" min-width="170" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadData"
        @size-change="handleSearch"
      />
    </div>

    <el-dialog v-model="detailVisible" title="日志详情" width="640px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="操作人">{{ currentLog.operatorName }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ currentLog.module }}</el-descriptions-item>
        <el-descriptions-item label="操作">{{ currentLog.operation }}</el-descriptions-item>
        <el-descriptions-item label="IP">{{ currentLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ currentLog.createTime }}</el-descriptions-item>
        <el-descriptions-item label="详情">{{ currentLog.detail }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getOperationLogs } from '../../api/system'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const detailVisible = ref(false)
const currentLog = ref({})

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  operatorName: '',
  module: ''
})

async function loadData() {
  loading.value = true
  try {
    const result = await getOperationLogs(query)
    tableData.value = result.data?.records || []
    total.value = result.data?.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.pageNum = 1
  loadData()
}

function resetSearch() {
  Object.assign(query, {
    pageNum: 1,
    pageSize: 10,
    operatorName: '',
    module: ''
  })
  loadData()
}

function openDetail(row) {
  currentLog.value = row
  detailVisible.value = true
}

onMounted(loadData)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 18px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
</style>
