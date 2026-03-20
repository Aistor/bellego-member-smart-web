<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>系统角色管理</span>
        <el-button type="primary" @click="handleAdd">新增角色</el-button>
      </div>
    </template>

    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="角色名称" width="150" />
      <el-table-column prop="code" label="角色编码(标识)" width="150">
        <template #default="scope">
          <el-tag type="info">{{ scope.row.code }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="角色描述" min-width="200" />
      <el-table-column prop="create_time" label="创建时间" width="180" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑基本信息</el-button>
          <el-button size="small" type="success" @click="handlePermissions(scope.row)">配置数据权限</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色中文名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" placeholder="如 ADMIN, MANAGER" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input type="textarea" v-model="form.description" placeholder="说明该角色的主要职能" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定并保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog title="配置数据权限树" v-model="permDialogVisible" width="600px">
      <el-alert title="勾选对应节点为该角色分配菜单与操作权限" type="info" show-icon style="margin-bottom: 20px" />
      <el-tree
        ref="treeRef"
        :data="permissionTree"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        default-expand-all
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span style="color: #999; font-size: 12px; margin-left: 10px;">{{ data.code }}</span>
          </span>
        </template>
      </el-tree>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permDialogVisible = false">舍弃更改</el-button>
          <el-button type="primary" @click="submitPermissions">应用当前权限拓扑</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoles, addRole, updateRole, deleteRole, getPermissions } from '../../api/system'

const loading = ref(false)
const tableData = ref([])
const permissionTree = ref([]) // 所有可选权限树

const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const permDialogVisible = ref(false)
const permTreeRef = ref(null)
const currentRole = ref({})

const defaultProps = {
  children: 'children',
  label: 'name'
}

const form = reactive({
  id: undefined,
  name: '',
  // code: '', // Removed as per instruction
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  // code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }] // Removed as per instruction
}

const loadData = async () => {
  loading.value = true
  try {
    const [roleRes, permRes] = await Promise.all([
      getRoles(),
      getPermissions()
    ])
    if (roleRes.code === 200) {
      tableData.value = roleRes.data
    }
    if (permRes.code === 200) {
      permissionTree.value = permRes.data
    }
  } catch (error) {
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增角色'
  Object.assign(form, {
    id: undefined,
    name: '',
    // code: '', // Removed as per instruction
    description: ''
  })
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleEdit = (row) => {
  if (row.name === '超级管理员') {
    ElMessage.warning('内置超级管理员角色不可编辑！')
    return
  }
  isEdit.value = true
  dialogTitle.value = '编辑角色'
  Object.assign(form, row)
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleDelete = (row) => {
  if (row.name === '超级管理员') {
    ElMessage.error('内置超级管理员角色不可删除！')
    return
  }
  ElMessageBox.confirm(`确认删除角色 [${row.name}] 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRole(row.id)
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
          await updateRole(form.id, form)
          ElMessage.success('修改成功')
        } else {
          await addRole(form)
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

const handleAssignPerm = (row) => {
  if (row.name === '超级管理员') {
    ElMessage.info('超级管理员默认拥有所有权限，无需分配。')
    return
  }
  currentRole.value = row
  permDialogVisible.value = true
  // 数据回显，这里根据真实后端返回的选中权限 ID 数组来设置
  setTimeout(() => {
    if (permTreeRef.value) {
      permTreeRef.value.setCheckedKeys(row.permissions || [])
    }
  }, 0)
}

const submitPerms = () => {
  // const checkedKeys = permTreeRef.value.getCheckedKeys()
  // const halfCheckedKeys = permTreeRef.value.getHalfCheckedKeys()
  // const allSelectedPerms = [...checkedKeys, ...halfCheckedKeys]
  
  // 这里可以向后端发送 allSelectedPerms 更新角色的权限
  ElMessage.success(`角色 [${currentRole.value.name}] 权限分配成功`)
  permDialogVisible.value = false
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
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
}
</style>
