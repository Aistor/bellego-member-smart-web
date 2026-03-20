<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>系统操作日志</span>
      </div>
    </template>

    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="日志ID" width="80" />
      <el-table-column prop="operator_name" label="操作人" width="120" />
      <el-table-column prop="ip" label="操作IP" width="150" />
      <el-table-column prop="module" label="所属模块" width="120">
        <template #default="scope">
          <el-tag type="info">{{ scope.row.module }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="operation" label="操作动作" width="150" />
      <el-table-column prop="detail" label="操作明细 (JSON)" min-width="250" show-overflow-tooltip />
      <el-table-column prop="create_time" label="操作时间" width="180" />
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOperationLogs } from '../../api/system'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await getOperationLogs()
    if (res.code === 200) {
      tableData.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取日志列表失败')
  } finally {
    loading.value = false
  }
}

const getTagType = (action) => {
  if (action === 'POST') return 'success'
  if (action === 'PUT') return 'warning'
  if (action === 'DELETE') return 'danger'
  return 'info'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
