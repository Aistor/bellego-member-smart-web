<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>会员列表</span>
        <el-button type="primary" @click="openCreate">新增会员</el-button>
      </div>
    </template>

    <el-form :inline="true" :model="query" class="search-form">
      <el-form-item label="关键词">
        <el-input v-model="query.keyword" placeholder="姓名/手机号/卡号" clearable />
      </el-form-item>
      <el-form-item label="会员等级">
        <el-select v-model="query.levelId" placeholder="全部等级" clearable style="width: 180px">
          <el-option
            v-for="item in levelOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData" border>
      <el-table-column prop="cardNumber" label="会员卡号" min-width="150" />
      <el-table-column prop="name" label="会员姓名" width="120" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column label="性别" width="90">
        <template #default="{ row }">{{ genderText(row.gender) }}</template>
      </el-table-column>
      <el-table-column label="等级" width="120">
        <template #default="{ row }">
          <el-tag>{{ levelName(row.levelId) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalPoints" label="总积分" width="100" />
      <el-table-column prop="totalConsumption" label="累计消费" width="120">
        <template #default="{ row }">￥{{ Number(row.totalConsumption || 0).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="lastConsumeTime" label="最后消费时间" min-width="170" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="(value) => changeStatus(row, value)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="170" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑会员' : '新增会员'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="会员等级" prop="levelId">
          <el-select v-model="form.levelId" placeholder="请选择会员等级" style="width: 100%">
            <el-option
              v-for="item in levelOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="会员姓名" prop="name">
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
          <el-date-picker
            v-model="form.birthday"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择生日"
            style="width: 100%"
          />
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
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createMember,
  getLevels,
  getMembers,
  updateMember,
  updateMemberStatus
} from '../../api/member'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const levelOptions = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  levelId: '',
  status: ''
})

const form = reactive({
  id: '',
  levelId: '',
  cardNumber: '',
  name: '',
  phone: '',
  gender: 1,
  birthday: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入会员姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const genderText = (value) => (Number(value) === 1 ? '男' : '女')
const levelName = (levelId) =>
  levelOptions.value.find((item) => item.id === levelId)?.name || '-'

async function loadLevels() {
  const result = await getLevels()
  levelOptions.value = result.data || []
  if (!form.levelId && levelOptions.value.length) {
    form.levelId = levelOptions.value[0].id
  }
}

async function loadData() {
  loading.value = true
  try {
    const result = await getMembers({
      ...query,
      levelId: query.levelId || undefined,
      status: query.status === '' ? undefined : query.status
    })
    tableData.value = result.data?.records || []
    total.value = result.data?.total || 0
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    id: '',
    levelId: levelOptions.value[0]?.id || '',
    cardNumber: '',
    name: '',
    phone: '',
    gender: 1,
    birthday: '',
    status: 1
  })
}

function openCreate() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    levelId: row.levelId,
    cardNumber: row.cardNumber,
    name: row.name,
    phone: row.phone,
    gender: row.gender,
    birthday: row.birthday,
    status: row.status
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
    keyword: '',
    levelId: '',
    status: ''
  })
  loadData()
}

async function changeStatus(row, value) {
  await updateMemberStatus(row.id, value)
  row.status = value
  ElMessage.success('状态更新成功')
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if (isEdit.value) {
      await updateMember(form.id, form)
      ElMessage.success('会员更新成功')
    } else {
      await createMember(form)
      ElMessage.success('会员创建成功')
    }
    dialogVisible.value = false
    loadData()
  })
}

onMounted(async () => {
  await loadLevels()
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
