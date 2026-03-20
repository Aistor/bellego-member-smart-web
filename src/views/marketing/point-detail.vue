<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">积分明细</h2>
        <p class="page-subtitle">分页查看积分变更记录，并支持 CSV 导入。</p>
      </div>
      <el-upload :auto-upload="false" :show-file-list="false" accept=".csv" :on-change="handleImport">
        <el-button>导入 CSV</el-button>
      </el-upload>
    </div>

    <div class="toolbar">
      <el-input v-model="query.memberId" placeholder="会员 ID" clearable style="width: 220px" />
      <el-input-number v-model="query.type" :min="1" placeholder="类型" controls-position="right" style="width: 160px" />
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border>
      <el-table-column prop="memberId" label="会员 ID" min-width="120" />
      <el-table-column label="类型" min-width="120">
        <template #default="{ row }">{{ getPointTypeLabel(row.type) }}</template>
      </el-table-column>
      <el-table-column prop="points" label="本次变动" min-width="100" />
      <el-table-column prop="balance" label="变动后余额" min-width="110" />
      <el-table-column prop="source" label="来源" min-width="120" />
      <el-table-column prop="sourceId" label="来源业务 ID" min-width="120" />
      <el-table-column prop="remark" label="备注" min-width="160" />
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
import { ElMessage } from 'element-plus'
import { getPointDetails, importPointDetails } from '../../api/marketing'
import { getPointTypeLabel, normalizePageData } from '../../utils/format'

const loading = ref(false)
const rows = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  memberId: '',
  type: undefined
})

const loadData = async () => {
  loading.value = true
  try {
    const response = await getPointDetails(query)
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
  Object.assign(query, { pageNum: 1, pageSize: 10, memberId: '', type: undefined })
  loadData()
}

const handleImport = async (file) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  await importPointDetails(formData)
  ElMessage.success('积分明细导入成功')
  loadData()
}

onMounted(loadData)
</script>
