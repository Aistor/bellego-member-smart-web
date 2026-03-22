<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">操作日志</h2>
      </div>
    </div>

    <div class="toolbar">
      <el-input v-model="query.operatorName" placeholder="操作人姓名" clearable style="width: 200px" />
      <el-input v-model="query.module" placeholder="操作模块" clearable style="width: 200px" />
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe show-overflow-tooltip>
      <el-table-column prop="operatorId" label="操作人 ID" min-width="120" />
      <el-table-column prop="operatorName" label="操作人" min-width="120" />
      <el-table-column prop="module" label="模块" min-width="120" />
      <el-table-column prop="operation" label="操作名称" min-width="140" />
      <el-table-column prop="detail" label="详情" min-width="260" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP 地址" min-width="120" />
      <el-table-column prop="createTime" label="创建时间" min-width="180" />
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadData"
        @size-change="loadData"
      />
    </div>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getLogs } from '../../api/system'
import { normalizePageData } from '../../utils/format'

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  operatorName: '',
  module: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const response = await getLogs(query)
    const page = normalizePageData(response.data)
    rows.value = page.records
    total.value = page.total
  } finally {
    loading.value = false
  }
}

const search = () => {
  query.pageNum = 1
  loadData()
}

const reset = () => {
  Object.assign(query, { pageNum: 1, pageSize: 10, operatorName: '', module: '' })
  loadData()
}

onMounted(loadData)
</script>
