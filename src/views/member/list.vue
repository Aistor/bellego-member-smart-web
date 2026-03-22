<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">会员列表</h2>
      </div>
      <div class="toolbar-actions">
        <el-upload :auto-upload="false" :show-file-list="false" accept=".csv" :on-change="handleImport">
          <el-button>导入 CSV</el-button>
        </el-upload>
        <el-button type="primary" @click="openDialog()">新增会员</el-button>
      </div>
    </div>

    <div class="toolbar">
      <el-input v-model="query.keyword" placeholder="姓名 / 手机号 / 卡号" clearable style="width: 260px" />
      <el-select v-model="query.levelId" clearable placeholder="会员等级" style="width: 160px">
        <el-option v-for="item in levels" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="query.status" clearable placeholder="状态" style="width: 140px">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe show-overflow-tooltip>
      <el-table-column prop="id" label="会员 ID" min-width="160" />
      <el-table-column prop="name" label="姓名" min-width="100" />
      <el-table-column prop="cardNumber" label="会员卡号" min-width="120" />
      <el-table-column prop="phone" label="手机号" min-width="120" />
      <el-table-column label="性别" min-width="70">
        <template #default="{ row }">{{ getGenderLabel(row.gender) }}</template>
      </el-table-column>
      <el-table-column label="等级" min-width="120">
        <template #default="{ row }">{{ levelNameMap[row.levelId] || '-' }}</template>
      </el-table-column>
      <el-table-column prop="totalPoints" label="总积分" min-width="90" />
      <el-table-column label="累计消费" min-width="110">
        <template #default="{ row }">¥ {{ formatCurrency(row.totalConsumption) }}</template>
      </el-table-column>
      <el-table-column prop="lastConsumeTime" label="最后消费时间" min-width="180" >
        <template #default="{ row }">{{ row.lastConsumeTime || '-' }}</template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="180" />
      <el-table-column label="状态" fixed="right" min-width="70">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="(value) => changeStatus(row, value)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" min-width="120">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑会员' : '新增会员'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="等级" prop="levelId">
          <el-select v-model="form.levelId" clearable placeholder="默认为普通会员" style="width: 100%">
            <el-option v-for="item in levels" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员卡号" prop="cardNumber">
          <el-input v-model="form.cardNumber" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker v-model="form.birthday" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
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
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createMember,
  getLevels,
  getMembers,
  importMembers,
  updateMember,
  updateMemberStatus
} from '../../api/member'
import { formatCurrency, getGenderLabel, normalizePageData } from '../../utils/format'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const editingId = ref('')
const rows = ref([])
const levels = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  levelId: '',
  status: undefined
})

const createDefaultForm = () => ({
  levelId: '',
  cardNumber: '',
  name: '',
  phone: '',
  gender: 1,
  birthday: '',
  status: 1
})

const form = reactive(createDefaultForm())

const rules = {
  cardNumber: [{ required: true, message: '请输入会员卡号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入会员姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const levelNameMap = computed(() =>
  Object.fromEntries((levels.value || []).map((item) => [item.id, item.name]))
)

const loadLevels = async () => {
  const response = await getLevels()
  levels.value = response.data || []
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await getMembers(query)
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
  Object.assign(query, { pageNum: 1, pageSize: 10, keyword: '', levelId: '', status: undefined })
  loadData()
}

const openDialog = (row) => {
  editingId.value = row?.id || ''
  Object.assign(form, createDefaultForm(), row || {})
  dialogVisible.value = true
}

const submit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (editingId.value) {
      await updateMember(editingId.value, form)
      ElMessage.success('会员已更新')
    } else {
      await createMember(form)
      ElMessage.success('会员已创建')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

const changeStatus = async (row, status) => {
  await updateMemberStatus(row.id, status)
  row.status = status
  ElMessage.success(`会员已${status === 1 ? '启用' : '禁用'}`)
}

const handleImport = async (file) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  await importMembers(formData)
  ElMessage.success('会员导入成功')
  loadData()
}

onMounted(async () => {
  await loadLevels()
  await loadData()
})
</script>
