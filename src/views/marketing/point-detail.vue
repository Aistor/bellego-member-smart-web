<template>
  <el-card shadow="never">

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
      <el-form-item label="类型">
        <el-select v-model="query.type" clearable placeholder="全部类型" style="width: 140px">
          <el-option label="消费获得积分" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData" max-height="70vh" border show-overflow-tooltip stripe>
      <el-table-column prop="id" label="明细ID" width="120" />
      <el-table-column label="会员名称" min-width="80">
        <template #default="{ row }">{{ memberName(row.memberId) }}</template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">{{ Number(row.type) === 1 ? '消费获得积分' : row.type }}</template>
      </el-table-column>
      <el-table-column prop="points" label="变动积分" width="120" />
      <el-table-column prop="balance" label="积分余额" width="120" />
      <el-table-column prop="source" label="来源" width="120" />
      <el-table-column prop="sourceId" label="来源业务ID" width="140" />
      <el-table-column prop="remark" label="备注" min-width="180" />
      <el-table-column prop="createTime" label="创建时间" min-width="170" />
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
import { ElMessage } from 'element-plus'
import { getMembers } from '../../api/member'
import { getPointDetails, importPointDetails } from '../../api/marketing'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const memberOptions = ref([])

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  memberId: '',
  type: ''
})

const memberName = (id) => memberOptions.value.find((item) => item.id === id)?.name || id || '-'

async function loadMembers() {
  const result = await getMembers({ pageNum: 1, pageSize: 200 })
  memberOptions.value = result.data?.records || []
}

async function loadData() {
  loading.value = true
  try {
    const result = await getPointDetails({
      ...query,
      memberId: query.memberId || undefined,
      type: query.type === '' ? undefined : query.type
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
    type: ''
  })
  loadData()
}

async function handleImport(file) {
  if (!file.raw) return
  await importPointDetails(file.raw)
  ElMessage.success('导入成功')
  loadData()
}

onMounted(async () => {
  await Promise.all([loadMembers(), loadData()])
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
