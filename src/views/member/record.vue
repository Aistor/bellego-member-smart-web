<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>消费记录</span>
        <el-button type="primary" @click="openCreate">新增消费记录</el-button>
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
      <el-form-item label="门店">
        <el-select v-model="query.storeId" clearable placeholder="全部门店" style="width: 180px">
          <el-option
            v-for="item in storeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData" border show-overflow-tooltip stripe>
      <el-table-column prop="id" label="记录ID" width="120" />
      <el-table-column label="会员姓名" min-width="60">
        <template #default="{ row }">{{ memberName(row.memberId) }}</template>
      </el-table-column>
      <el-table-column label="门店" min-width="150">
        <template #default="{ row }">{{ storeName(row.storeId) }}</template>
      </el-table-column>
      <el-table-column prop="amount" label="消费金额" width="120">
        <template #default="{ row }">￥{{ Number(row.amount || 0).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="pointsEarned" label="获得积分" width="100" />
      <el-table-column prop="consumeTime" label="消费时间" min-width="170" />
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

    <el-dialog v-model="dialogVisible" title="新增消费记录" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="会员" prop="memberId">
          <el-select v-model="form.memberId" filterable placeholder="请选择会员" style="width: 100%">
            <el-option
              v-for="item in memberOptions"
              :key="item.id"
              :label="`${item.name} / ${item.phone}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="门店" prop="storeId">
          <el-select v-model="form.storeId" placeholder="请选择门店" style="width: 100%">
            <el-option
              v-for="item in storeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消费金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0.01" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="消费时间">
          <el-date-picker
            v-model="form.consumeTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="不填则使用当前时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createConsumption, getConsumptions, getMembers } from '../../api/member'
import { getStores } from '../../api/system'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const memberOptions = ref([])
const storeOptions = ref([])
const dialogVisible = ref(false)
const formRef = ref()

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  memberId: '',
  storeId: ''
})

const form = reactive({
  memberId: '',
  storeId: '',
  amount: 0.01,
  consumeTime: ''
})

const rules = {
  memberId: [{ required: true, message: '请选择会员', trigger: 'change' }],
  storeId: [{ required: true, message: '请选择门店', trigger: 'change' }],
  amount: [{ required: true, message: '请输入消费金额', trigger: 'blur' }]
}

const memberName = (id) => memberOptions.value.find((item) => item.id === id)?.name || id || '-'
const storeName = (id) => storeOptions.value.find((item) => item.id === id)?.name || id || '-'

async function loadOptions() {
  const [membersResult, storesResult] = await Promise.all([
    getMembers({ pageNum: 1, pageSize: 200 }),
    getStores({ pageNum: 1, pageSize: 200 })
  ])
  memberOptions.value = membersResult.data?.records || []
  storeOptions.value = storesResult.data?.records || []
  if (!form.storeId && storeOptions.value.length) {
    form.storeId = storeOptions.value[0].id
  }
}

async function loadData() {
  loading.value = true
  try {
    const result = await getConsumptions({
      ...query,
      memberId: query.memberId || undefined,
      storeId: query.storeId || undefined
    })
    tableData.value = result.data?.records || []
    total.value = result.data?.total || 0
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(form, {
    memberId: '',
    storeId: storeOptions.value[0]?.id || '',
    amount: 0.01,
    consumeTime: ''
  })
  dialogVisible.value = true
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
    storeId: ''
  })
  loadData()
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    await createConsumption({
      memberId: form.memberId,
      storeId: form.storeId,
      amount: form.amount,
      consumeTime: form.consumeTime || undefined
    })
    ElMessage.success('消费记录创建成功')
    dialogVisible.value = false
    loadData()
  })
}

onMounted(async () => {
  await loadOptions()
  await loadData()
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
