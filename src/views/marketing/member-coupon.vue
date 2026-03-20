<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">会员优惠券</h2>
        <p class="page-subtitle">分页查看会员领券记录，并支持核销。</p>
      </div>
    </div>

    <div class="toolbar">
      <el-input v-model="query.memberId" placeholder="会员 ID" clearable style="width: 220px" />
      <el-select v-model="query.status" clearable placeholder="优惠券状态" style="width: 150px">
        <el-option label="未使用" :value="0" />
        <el-option label="已使用" :value="1" />
      </el-select>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border>
      <el-table-column prop="memberId" label="会员 ID" min-width="120" />
      <el-table-column prop="couponId" label="优惠券 ID" min-width="120" />
      <el-table-column prop="code" label="券码" min-width="160" />
      <el-table-column label="状态" min-width="90">
        <template #default="{ row }">{{ getCouponStatusLabel(row.status) }}</template>
      </el-table-column>
      <el-table-column prop="receiveTime" label="领取时间" min-width="180" />
      <el-table-column prop="useTime" label="使用时间" min-width="180" />
      <el-table-column prop="expireTime" label="过期时间" min-width="180" />
      <el-table-column label="操作" min-width="100">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="row.status === 1" @click="consume(row.id)">核销</el-button>
        </template>
      </el-table-column>
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
import { getMemberCoupons, useMemberCoupon } from '../../api/marketing'
import { getCouponStatusLabel, normalizePageData } from '../../utils/format'

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  memberId: '',
  status: undefined
})

const loadData = async () => {
  loading.value = true
  try {
    const response = await getMemberCoupons(query)
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
  Object.assign(query, { pageNum: 1, pageSize: 10, memberId: '', status: undefined })
  loadData()
}

const consume = async (id) => {
  await useMemberCoupon(id)
  ElMessage.success('核销成功')
  loadData()
}

onMounted(loadData)
</script>
