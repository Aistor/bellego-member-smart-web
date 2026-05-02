<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>权限管理</span>
        <el-button type="primary" @click="openCreate()">新增权限</el-button>
      </div>
    </template>

    <el-table
      v-loading="loading"
      :data="treeData"
      row-key="id"
      border
      default-expand-all
      :tree-props="{ children: 'children' }"
      max-height="70vh"
    >
      <el-table-column prop="name" label="权限名称" min-width="200" />
      <el-table-column prop="code" label="权限编码" min-width="200" />
      <el-table-column prop="type" label="类型" min-width="120">
        <template #default="{ row }">{{ Number(row.type) === 1 ? '菜单' : '按钮' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openCreate(row)">新增子权限</el-button>
          <el-button link type="warning" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="removePermission(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑权限' : '新增权限'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="父级权限">
          <el-tree-select
            v-model="form.parentId"
            :data="treeData"
            node-key="id"
            check-strictly
            clearable
            default-expand-all
            :props="{ label: 'name', children: 'children' }"
            placeholder="根节点可留空"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">菜单</el-radio>
            <el-radio :value="2">按钮</el-radio>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createPermission,
  deletePermission,
  getPermissionTree,
  updatePermission
} from '../../api/system'

const loading = ref(false)
const treeData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: '',
  parentId: '',
  name: '',
  code: '',
  type: 1
})

const rules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }]
}

async function loadData() {
  loading.value = true
  try {
    const result = await getPermissionTree()
    treeData.value = result.data || []
  } finally {
    loading.value = false
  }
}

function resetForm(parentId = '') {
  Object.assign(form, {
    id: '',
    parentId,
    name: '',
    code: '',
    type: 1
  })
}

function openCreate(parent = null) {
  isEdit.value = false
  resetForm(parent?.id || '')
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    parentId: row.parentId || '',
    name: row.name,
    code: row.code,
    type: row.type
  })
  dialogVisible.value = true
}

async function removePermission(row) {
  await ElMessageBox.confirm(`确认删除权限“${row.name}”？`, '提示', { type: 'warning' })
  await deletePermission(row.id)
  ElMessage.success('删除成功')
  loadData()
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    const payload = {
      ...form,
      parentId: form.parentId || undefined
    }
    if (isEdit.value) {
      await updatePermission(form.id, payload)
      ElMessage.success('权限更新成功')
    } else {
      await createPermission(payload)
      ElMessage.success('权限创建成功')
    }
    dialogVisible.value = false
    loadData()
  })
}

onMounted(loadData)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
