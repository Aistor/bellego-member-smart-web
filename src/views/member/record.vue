<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">消费记录</h2>
      </div>
      <div class="toolbar-actions">
        <el-upload :auto-upload="false" :show-file-list="false" accept=".csv" :on-change="handleImport">
          <el-button>导入 CSV</el-button>
        </el-upload>
        <el-button type="primary" @click="openDialog">新增记录</el-button>
      </div>
    </div>

    <div class="toolbar">
      <el-input v-model="query.memberId" placeholder="会员 ID" clearable style="width: 200px" />
      <el-input v-model="query.storeId" placeholder="门店 ID" clearable style="width: 200px" />
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe show-overflow-tooltip>
      <el-table-column prop="memberId" label="会员 ID" min-width="120" />
      <el-table-column prop="storeId" label="门店 ID" min-width="120" />
      <el-table-column label="消费金额" min-width="120">
        <template #default="{ row }">¥ {{ formatCurrency(row.amount) }}</template>
      </el-table-column>
      <el-table-column prop="pointsEarned" label="本次积分" min-width="100" />
      <el-table-column prop="consumeTime" label="消费时间" min-width="180" />
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

    <el-dialog v-model="dialogVisible" title="新增消费记录" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="会员 ID" prop="memberId"><el-input v-model="form.memberId" /></el-form-item>
        <el-form-item label="门店 ID" prop="storeId"><el-input v-model="form.storeId" /></el-form-item>
        <el-form-item label="消费金额" prop="amount"><el-input-number v-model="form.amount" :min="0.01" :precision="2" style="width: 100%" /></el-form-item>
        <el-form-item label="消费时间">
          <el-date-picker
            v-model="form.consumeTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createConsumption, getConsumptions, importConsumptions } from '../../api/member'
import { formatCurrency, normalizePageData } from '../../utils/format'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const rows = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  memberId: '',
  storeId: ''
})

const createDefaultForm = () => ({
  memberId: '',
  storeId: '',
  amount: 0,
  consumeTime: ''
})

const form = reactive(createDefaultForm())

const rules = {
  memberId: [{ required: true, message: '请输入会员 ID', trigger: 'blur' }],
  storeId: [{ required: true, message: '请输入门店 ID', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入消费金额', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await getConsumptions(query)
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
  Object.assign(query, { pageNum: 1, pageSize: 10, memberId: '', storeId: '' })
  loadData()
}

const openDialog = () => {
  Object.assign(form, createDefaultForm())
  dialogVisible.value = true
}

const submit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await createConsumption(form)
    ElMessage.success('消费记录已创建')
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

const handleImport = async (file) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  await importConsumptions(formData)
  ElMessage.success('消费记录导入成功')
  loadData()
}

onMounted(loadData)
</script>
