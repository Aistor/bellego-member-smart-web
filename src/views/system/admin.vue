<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">管理员管理</h2>
      </div>
      <el-button type="primary" @click="openDialog()">新增管理员</el-button>
    </div>

    <div class="toolbar">
      <el-input v-model="query.keyword" placeholder="用户名 / 姓名 / 手机号" clearable style="width: 260px" />
      <el-select v-model="query.status" clearable placeholder="状态" style="width: 140px">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe show-overflow-tooltip>
      <el-table-column prop="username" label="用户名" min-width="140" />
      <el-table-column prop="realName" label="真实姓名" min-width="120" />
      <el-table-column prop="phone" label="手机号" min-width="140" />
      <el-table-column label="状态" min-width="90">
        <template #default="{ row }">
          <el-switch :model-value="row.status" :active-value="1" :inactive-value="0" @change="(value) => changeStatus(row, value)" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="180" />
      <el-table-column label="操作" fixed="right" min-width="210">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-button link type="success" @click="openRoleDialog(row)">分配角色</el-button>
          <el-button link type="danger" @click="remove(row.id)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑管理员' : '新增管理员'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username"><el-input v-model="form.username" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" type="password" show-password placeholder="不填则使用默认或保持原密码" /></el-form-item>
        <el-form-item label="真实姓名"><el-input v-model="form.realName" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
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

    <el-dialog v-model="roleDialogVisible" title="分配角色" width="460px">
      <el-checkbox-group v-model="selectedRoleIds">
        <el-space wrap>
          <el-checkbox v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</el-checkbox>
        </el-space>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assigning" @click="submitRoles">保存</el-button>
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
import { normalizePageData } from '../../utils/format'

const loading = ref(false)
const submitting = ref(false)
const assigning = ref(false)
const dialogVisible = ref(false)
const roleDialogVisible = ref(false)
const formRef = ref()
const editingId = ref('')
const roleTargetId = ref('')
const rows = ref([])
const roles = ref([])
const selectedRoleIds = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: undefined
})

const createDefaultForm = () => ({
  username: '',
  password: '',
  realName: '',
  phone: '',
  status: 1
})

const form = reactive(createDefaultForm())

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const loadRoles = async () => {
  const response = await getRoles({ pageNum: 1, pageSize: 200 })
  roles.value = normalizePageData(response.data).records
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await getAdmins(query)
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
  Object.assign(query, { pageNum: 1, pageSize: 10, keyword: '', status: undefined })
  loadData()
}

const openDialog = (row) => {
  editingId.value = row?.id || ''
  Object.assign(form, createDefaultForm(), row || {})
  form.password = ''
  dialogVisible.value = true
}

const submit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (editingId.value) {
      await updateAdmin(editingId.value, form)
      ElMessage.success('管理员已更新')
    } else {
      await createAdmin(form)
      ElMessage.success('管理员已创建')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

const changeStatus = async (row, status) => {
  await updateAdminStatus(row.id, status)
  row.status = status
  ElMessage.success('状态已更新')
}

const remove = async (id) => {
  await ElMessageBox.confirm('删除后会移除角色关联，是否继续？', '删除管理员', { type: 'warning' })
  await deleteAdmin(id)
  ElMessage.success('管理员已删除')
  loadData()
}

const openRoleDialog = (row) => {
  roleTargetId.value = row.id
  selectedRoleIds.value = row.roleIds || []
  roleDialogVisible.value = true
}

const submitRoles = async () => {
  assigning.value = true
  try {
    await assignAdminRoles(roleTargetId.value, selectedRoleIds.value)
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
    loadData()
  } finally {
    assigning.value = false
  }
}

onMounted(async () => {
  await loadRoles()
  await loadData()
})
</script>
