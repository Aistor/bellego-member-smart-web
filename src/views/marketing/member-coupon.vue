<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>会员优惠券</span>
      </div>
    </template>

    <el-form :inline="true" :model="query" class="search-form">
      <el-form-item label="会员">
        <el-select v-model="query.memberId" clearable filterable placeholder="全部会员" style="width: 180px">
          <el-option
            v-for="item in memberOptions"
            :key="item.id"
            :label="`${item.name} / ${item.phone}`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 140px">
          <el-option label="未使用" :value="0" />
          <el-option label="已使用" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData" max-height="60vh" border show-overflow-tooltip stripe>
      <el-table-column prop="id" label="记录ID" width="140" />
      <el-table-column prop="memberName" label="会员名称" min-width="100" />
      <el-table-column prop="couponName" label="优惠券" min-width="160" />
      <el-table-column prop="code" label="券码" min-width="160" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="Number(row.status) === 1 ? 'info' : 'success'">
            {{ Number(row.status) === 1 ? '已使用' : '未使用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="receiveTime" label="领取时间" min-width="170" />
      <el-table-column prop="useTime" label="使用时间" min-width="170" />
      <el-table-column prop="expireTime" label="过期时间" min-width="170" />
      <el-table-column label="操作" width="110" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            :disabled="Number(row.status) === 1"
            @click="handleUse(row)"
          >
            核销
          </el-button>
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
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMembers } from '../../api/member'
import { getMemberCoupons, useMemberCoupon } from '../../api/marketing'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const memberOptions = ref([])

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  memberId: '',
  status: ''
})

async function loadMembers() {
  const result = await getMembers({ pageNum: 1, pageSize: 200 })
  memberOptions.value = result.data?.records || []
}

async function loadData() {
  loading.value = true
  try {
    const result = await getMemberCoupons({
      ...query,
      memberId: query.memberId || undefined,
      status: query.status === '' ? undefined : query.status
    })
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
    memberId: '',
    status: ''
  })
  loadData()
}

async function handleUse(row) {
  await ElMessageBox.confirm(`确认核销券码 ${row.code} 吗？`, '提示', { type: 'warning' })
  await useMemberCoupon(row.id)
  ElMessage.success('核销成功')
  loadData()
}

onMounted(async () => {
  await Promise.all([loadData(), loadMembers()])
})
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
