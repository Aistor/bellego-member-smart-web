<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>管理员管理</span>
        <el-button type="primary" @click="openCreate">新增管理员</el-button>
      </div>
    </template>

    <el-form :inline="true" :model="query" class="search-form">
      <el-form-item label="关键词">
        <el-input v-model="query.keyword" placeholder="用户名/姓名/手机号" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 140px">
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
      <el-table-column prop="username" label="用户名" width="160" />
      <el-table-column prop="realName" label="真实姓名" width="140" />
      <el-table-column prop="phone" label="手机号" width="150" />
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
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="warning" @click="openAssign(row)">分配角色</el-button>
          <el-button link type="danger" @click="removeAdmin(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑管理员' : '新增管理员'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="编辑时留空则不修改" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
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

    <el-dialog v-model="assignVisible" title="分配角色" width="520px">
      <el-form label-width="100px">
        <el-form-item label="管理员">
          <span>{{ currentAdmin?.username || '-' }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="selectedRoleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="item in roleOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  assignAdminRoles,
  createAdmin,
  deleteAdmin,
  getAdmins,
  getRoles,
  updateAdmin,
  updateAdminStatus
} from '../../api/system'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const roleOptions = ref([])
const dialogVisible = ref(false)
const assignVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const currentAdmin = ref(null)
const selectedRoleIds = ref([])

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: ''
})

const form = reactive({
  id: '',
  username: '',
  password: '',
  realName: '',
  phone: '',
  status: 1
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

async function loadRoles() {
  const result = await getRoles({ pageNum: 1, pageSize: 200 })
  roleOptions.value = result.data?.records || []
}

async function loadData() {
  loading.value = true
  try {
    const result = await getAdmins({
      ...query,
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
    username: '',
    password: '',
    realName: '',
    phone: '',
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
    username: row.username,
    password: '',
    realName: row.realName,
    phone: row.phone,
    status: row.status
  })
  dialogVisible.value = true
}

function openAssign(row) {
  currentAdmin.value = row
  selectedRoleIds.value = row.roleIds || []
  assignVisible.value = true
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
    status: ''
  })
  loadData()
}

async function changeStatus(row, value) {
  await updateAdminStatus(row.id, value)
  row.status = value
  ElMessage.success('状态更新成功')
}

async function removeAdmin(row) {
  await ElMessageBox.confirm(`确认删除管理员“${row.username}”？`, '提示', { type: 'warning' })
  await deleteAdmin(row.id)
  ElMessage.success('删除成功')
  loadData()
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    const payload = {
      ...form,
      password: form.password || undefined
    }
    if (isEdit.value) {
      await updateAdmin(form.id, payload)
      ElMessage.success('管理员更新成功')
    } else {
      await createAdmin(payload)
      ElMessage.success('管理员创建成功')
    }
    dialogVisible.value = false
    loadData()
  })
}

async function submitAssign() {
  if (!currentAdmin.value) return
  await assignAdminRoles(currentAdmin.value.id, selectedRoleIds.value)
  ElMessage.success('角色分配成功')
  assignVisible.value = false
  loadData()
}

onMounted(async () => {
  await Promise.all([loadData(), loadRoles()])
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
