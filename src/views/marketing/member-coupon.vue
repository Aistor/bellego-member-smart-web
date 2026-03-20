<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>会员持券总览</span>
      </div>
    </template>

    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="记录ID" width="80" />
      <el-table-column label="会员姓名" width="120">
        <template #default="scope">
          {{ getMemberName(scope.row.member_id) }}
        </template>
      </el-table-column>
      <el-table-column label="卡券名称" min-width="150">
        <template #default="scope">
          {{ getCouponName(scope.row.coupon_id) }}
        </template>
      </el-table-column>
      <el-table-column prop="code" label="核销编码" width="160">
        <template #default="scope">
          <el-tag type="info">{{ scope.row.code }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" type="success">未使用</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="info">已使用</el-tag>
          <el-tag v-else type="danger">已过期</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="receive_time" label="领取时间" width="160" />
      <el-table-column prop="use_time" label="使用时间" width="160">
        <template #default="scope">
          {{ scope.row.use_time || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            :disabled="scope.row.status !== 0"
            @click="handleUse(scope.row)"
          >
            模拟核销
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMemberCoupons, useMemberCoupon } from '../../api/marketing'

const loading = ref(false)
const tableData = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMemberCoupons()
    if (res.code === 200) {
      tableData.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取会员卡券记录失败')
  } finally {
    loading.value = false
  }
}

const getMemberName = (id) => {
  // 原本从 memberList 取，现改为前后端解耦后由接口直接返回
  return `会员-${id}`
}

const getCouponName = (id) => {
  // 原本从 couponList 取，现改为接口直接返回
  return `卡券-${id}`
}

const handleUse = (row) => {
  ElMessageBox.confirm(`确认核销卡券码 [${row.code}] 吗？`, '核销确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await useMemberCoupon(row.id)
      ElMessage.success('核销成功')
      loadData()
    } catch (error) {
      ElMessage.error(error.message || '核销失败')
    }
  }).catch(() => {})
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
