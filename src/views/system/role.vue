<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">角色管理</h2>
      </div>
      <el-button type="primary" @click="openDialog()">新增角色</el-button>
    </div>

    <div class="toolbar">
      <el-input v-model="query.keyword" placeholder="角色名称 / 编码" clearable style="width: 240px" />
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe show-overflow-tooltip>
      <el-table-column prop="name" label="角色名称" min-width="140" />
      <el-table-column prop="code" label="角色编码" min-width="140" />
      <el-table-column prop="description" label="角色描述" min-width="240" />
      <el-table-column prop="createTime" label="创建时间" min-width="180" />
      <el-table-column label="操作" fixed="right" min-width="210">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-button link type="success" @click="openPermissionDialog(row)">分配权限</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑角色' : '新增角色'" width="540px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="角色编码" prop="code"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="角色描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="permissionDialogVisible" title="分配权限" width="520px">
      <el-tree
        ref="treeRef"
        node-key="id"
        show-checkbox
        default-expand-all
        :data="permissionTree"
        :props="{ label: 'name', children: 'children' }"
      />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assigning" @click="submitPermissions">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  assignRolePermissions,
  createRole,
  deleteRole,
  getPermissionTree,
  getRoles,
  updateRole
} from '../../api/system'
import { normalizePageData } from '../../utils/format'

const loading = ref(false)
const submitting = ref(false)
const assigning = ref(false)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const formRef = ref()
const treeRef = ref()
const editingId = ref('')
const permissionTargetId = ref('')
const rows = ref([])
const permissionTree = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: ''
})

const form = reactive({
  name: '',
  code: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

const loadPermissionTree = async () => {
  const response = await getPermissionTree()
  permissionTree.value = response.data || []
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await getRoles(query)
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
  Object.assign(query, { pageNum: 1, pageSize: 10, keyword: '' })
  loadData()
}

const openDialog = (row) => {
  editingId.value = row?.id || ''
  Object.assign(form, { name: '', code: '', description: '' }, row || {})
  dialogVisible.value = true
}

const submit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (editingId.value) {
      await updateRole(editingId.value, form)
      ElMessage.success('角色已更新')
    } else {
      await createRole(form)
      ElMessage.success('角色已创建')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

const remove = async (id) => {
  await ElMessageBox.confirm('删除后不可恢复，是否继续？', '删除角色', { type: 'warning' })
  await deleteRole(id)
  ElMessage.success('角色已删除')
  loadData()
}

const openPermissionDialog = (row) => {
  permissionTargetId.value = row.id
  permissionDialogVisible.value = true
  setTimeout(() => {
    treeRef.value?.setCheckedKeys(row.permissionIds || [])
  }, 0)
}

const submitPermissions = async () => {
  assigning.value = true
  try {
    const checkedKeys = treeRef.value?.getCheckedKeys(false) || []
    await assignRolePermissions(permissionTargetId.value, checkedKeys)
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
    loadData()
  } finally {
    assigning.value = false
  }
}

onMounted(async () => {
  await loadPermissionTree()
  await loadData()
})
</script>
