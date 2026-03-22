<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">权限管理</h2>
      </div>
      <el-button type="primary" @click="openDialog()">新增权限</el-button>
    </div>

    <el-table :data="flatRows" v-loading="loading" row-key="id" border default-expand-all :tree-props="{ children: 'children' }">
      <el-table-column prop="name" label="权限名称" min-width="180" />
      <el-table-column prop="code" label="权限编码" min-width="180" />
      <el-table-column label="类型" min-width="100">
        <template #default="{ row }">{{ getPermissionTypeLabel(row.type) }}</template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" min-width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑权限' : '新增权限'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="权限名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="权限编码" prop="code"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">菜单</el-radio>
            <el-radio :value="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="父级权限">
          <el-tree-select
            v-model="form.parentId"
            :data="treeRows"
            check-strictly
            clearable
            default-expand-all
            :render-after-expand="false"
            :props="{ label: 'name', value: 'id', children: 'children' }"
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
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createPermission,
  deletePermission,
  getPermissionTree,
  updatePermission
} from '../../api/system'
import { getPermissionTypeLabel } from '../../utils/format'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const editingId = ref('')
const treeRows = ref([])

const form = reactive({
  name: '',
  code: '',
  type: 1,
  parentId: ''
})

const rules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }]
}

const flatRows = computed(() => treeRows.value)

const loadData = async () => {
  loading.value = true
  try {
    const response = await getPermissionTree()
    treeRows.value = response.data || []
  } finally {
    loading.value = false
  }
}

const openDialog = (row) => {
  editingId.value = row?.id || ''
  Object.assign(form, { name: '', code: '', type: 1, parentId: '' }, row || {})
  dialogVisible.value = true
}

const submit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (editingId.value) {
      await updatePermission(editingId.value, form)
      ElMessage.success('权限已更新')
    } else {
      await createPermission(form)
      ElMessage.success('权限已创建')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

const remove = async (id) => {
  await ElMessageBox.confirm('删除后不可恢复，是否继续？', '删除权限', { type: 'warning' })
  await deletePermission(id)
  ElMessage.success('权限已删除')
  loadData()
}

onMounted(loadData)
</script>
