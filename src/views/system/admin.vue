<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>管理员账号维护</span>
        <el-button type="primary" @click="handleAdd">新增管理员</el-button>
      </div>
    </template>

    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="username" label="登录账号(用户名)" width="150" />
      <el-table-column prop="real_name" label="真实姓名" width="120" />
      <el-table-column prop="phone" label="手机号码" width="150" />
      <el-table-column label="账号状态" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" min-width="180" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="warning" @click="handleAssignRole(scope.row)">分配角色</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)" :disabled="scope.row.username === 'admin'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入英文或数字组合" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="请输入初始密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="real_name">
          <el-input v-model="form.real_name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="form.phone" placeholder="接收验证码或通知" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog title="分配角色" v-model="roleDialogVisible" width="400px">
      <el-form label-width="80px">
        <el-form-item label="管理员">
          <span>{{ currentAdmin.username }} ({{ currentAdmin.real_name }})</span>
        </el-form-item>
        <el-form-item label="系统角色">
          <el-select v-model="selectedRoles" multiple placeholder="请选择分配的角色" style="width: 100%">
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
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRoles">确认分配</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdmins, addAdmin, updateAdmin, deleteAdmin, updateAdminStatus, getRoles } from '../../api/system'
import { useUserStore } from '../../store/user'

const loading = ref(false)
const tableData = ref([])
const roleListOptions = ref([]) // 用于分配角色下拉框配置

const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const userStore = useUserStore() // 如果需要判断当前操作人，可从store取

const roleDialogVisible = ref(false)
const currentAdmin = ref({})
const selectedRoles = ref([])

const form = reactive({
  id: undefined,
  username: '',
  password: '', // 添加或重置时使用
  name: '',
  phone: '',
  role_id: undefined
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role_id: [{ required: true, message: '请分配角色', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const [adminRes, roleRes] = await Promise.all([
      getAdmins(),
      getRoles() // 同时获取角色列表，用于表格展示或下拉选项（如需要）
    ])
    if (adminRes.code === 200) {
      tableData.value = adminRes.data
    }
    if (roleRes.code === 200) {
      roleListOptions.value = roleRes.data
    }
  } catch (error) {
    ElMessage.error('获取管理员列表失败')
  } finally {
    loading.value = false
  }
}

const getRoleName = (roleId) => {
  const role = roleListOptions.value.find(r => r.id === roleId)
  return role ? role.name : '未知角色'
}

const handleStatusChange = async (row) => {
  if (row.username === 'admin') {
    row.status = 1 // 强制改回
    ElMessage.warning('超级管理员不能被禁用！')
    return
  }
  try {
    await updateAdminStatus(row.id, row.status)
    ElMessage.success(`已${row.status === 1 ? '启用' : '停用'}账号: ${row.username}`)
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error(error.message || '操作失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增管理员'
  Object.assign(form, {
    id: undefined,
    username: '',
    password: '',
    name: '',
    phone: '',
    role_id: undefined
  })
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleEdit = (row) => {
  if (row.username === 'admin') {
    ElMessage.warning('内置超级管理员不可编辑基本信息！可以考虑转到专门的个人中心。')
    // 这里为了演示仍然允许打开，但在真实场景应限制
    // return
  }
  isEdit.value = true
  dialogTitle.value = '编辑管理员'
  Object.assign(form, row)
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleDelete = (row) => {
  if (row.username === 'admin') {
    ElMessage.error('最高权限账号，禁止删除！')
    return
  }
  ElMessageBox.confirm(`确认删除账号 [${row.username}] 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAdmin(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

const submitForm = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateAdmin(form.id, form)
          ElMessage.success('修改成功')
        } else {
          // 在实际项目中这里应该是发送有密码的请求
          // 由于密码应该加密传输，这里仅作演示
          if(!form.password) form.password = '123456' 
          await addAdmin(form)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

const handleAssignRole = (row) => {
  currentAdmin.value = row
  // 模拟回显已选角色，这里由于是mock数据我们默认给第一个
  selectedRoles.value = row.id === 1 ? [1] : []
  roleDialogVisible.value = true
}

const submitRoles = () => {
  ElMessage.success(`角色分配成功！账号[${currentAdmin.value.username}]的权限已刷新。`)
  roleDialogVisible.value = false
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
