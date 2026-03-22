<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>角色管理</span>
        <el-button type="primary" @click="openCreate">新增角色</el-button>
      </div>
    </template>

    <el-form :inline="true" :model="query" class="search-form">
      <el-form-item label="关键词">
        <el-input v-model="query.keyword" placeholder="角色名称/编码" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData" border>
      <el-table-column prop="name" label="角色名称" min-width="160" />
      <el-table-column prop="code" label="角色编码" width="160" />
      <el-table-column prop="description" label="角色描述" min-width="220" />
      <el-table-column prop="createTime" label="创建时间" min-width="170" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="warning" @click="openAssign(row)">分配权限</el-button>
          <el-button link type="danger" @click="removeRole(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="assignVisible" title="分配权限" width="640px">
      <el-tree
        ref="treeRef"
        :data="permissionTree"
        node-key="id"
        show-checkbox
        default-expand-all
        :props="{ label: 'name', children: 'children' }"
      />
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  assignRolePermissions,
  createRole,
  deleteRole,
  getPermissionTree,
  getRolePermissionIds,
  getRoles,
  updateRole
} from '../../api/system'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const permissionTree = ref([])
const dialogVisible = ref(false)
const assignVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const treeRef = ref()
const currentRole = ref(null)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: ''
})

const form = reactive({
  id: '',
  name: '',
  code: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

async function loadPermissions() {
  const result = await getPermissionTree()
  permissionTree.value = result.data || []
}

async function loadData() {
  loading.value = true
  try {
    const result = await getRoles(query)
    tableData.value = result.data?.records || []
    total.value = result.data?.total || 0
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    id: '',
    name: '',
    code: '',
    description: ''
  })
}

function openCreate() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

async function openAssign(row) {
  currentRole.value = row
  assignVisible.value = true
  await nextTick()
  const result = await getRolePermissionIds(row.id)
  const permissionIds = result.data?.permissionIds || []
  treeRef.value.setCheckedKeys(permissionIds)
}

function handleSearch() {
  query.pageNum = 1
  loadData()
}

function resetSearch() {
  Object.assign(query, {
    pageNum: 1,
    pageSize: 10,
    keyword: ''
  })
  loadData()
}

async function removeRole(row) {
  await ElMessageBox.confirm(`确认删除角色“${row.name}”？`, '提示', { type: 'warning' })
  await deleteRole(row.id)
  ElMessage.success('删除成功')
  loadData()
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if (isEdit.value) {
      await updateRole(form.id, form)
      ElMessage.success('角色更新成功')
    } else {
      await createRole(form)
      ElMessage.success('角色创建成功')
    }
    dialogVisible.value = false
    loadData()
  })
}

async function submitAssign() {
  if (!currentRole.value) return
  const checked = treeRef.value.getCheckedKeys()
  const halfChecked = treeRef.value.getHalfCheckedKeys()
  await assignRolePermissions(currentRole.value.id, [...checked, ...halfChecked])
  ElMessage.success('权限分配成功')
  assignVisible.value = false
}

onMounted(async () => {
  await Promise.all([loadData(), loadPermissions()])
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
