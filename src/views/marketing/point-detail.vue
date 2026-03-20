<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>积分获取与验证记录</span>
      </div>
    </template>

    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="记录ID" width="80" />
      <el-table-column label="会员" width="120">
        <template #default="scope">
          {{ getMemberName(scope.row.member_id) }}
        </template>
      </el-table-column>
      <el-table-column label="变动类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.type === 1 ? 'success' : (scope.row.type === 2 ? 'warning' : 'danger')">
            {{ scope.row.type === 1 ? '获取' : (scope.row.type === 2 ? '兑换/消耗' : '过期') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="积分变动" width="120">
        <template #default="scope">
          <span :style="{ color: scope.row.points > 0 ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
            {{ scope.row.points > 0 ? '+' : '' }}{{ scope.row.points }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="balance" label="变动后余额" width="120" />
      <el-table-column prop="source" label="来源" width="100" />
      <el-table-column prop="remark" label="备注" min-width="150" />
      <el-table-column prop="create_time" label="变动时间" width="160" />
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPointDetails } from '../../api/marketing'

const loading = ref(false)
const tableData = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPointDetails()
    if (res.code === 200) {
      tableData.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取明细列表失败')
  } finally {
    loading.value = false
  }
}

const getMemberName = (id) => {
  // 原本通过 memberList 取，现改为前后端解耦由后端返回
  return `会员-${id}`
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
