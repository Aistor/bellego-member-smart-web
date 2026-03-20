<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>系统权限字典与权限树拓扑结构</span>
        <el-tag type="warning" disable-transitions>说明：此页面通常由系统开发人员维护，用于定义路由级/按钮级权限</el-tag>
      </div>
    </template>

    <div style="margin-bottom: 20px;">
      <el-button type="primary" @click="handleAddRoot">新增根权限节点</el-button>
    </div>

    <el-table
      :data="tableData"
      border
      style="width: 100%"
      row-key="id"
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      v-loading="loading"
    >
      <el-table-column prop="name" label="权限名称" min-width="180" />
      <el-table-column prop="code" label="权限编码(标识)" width="180">
        <template #default="scope">
          <el-tag type="info">{{ scope.row.code }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="节点类型" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.type === 1 ? '' : 'success'">
            {{ scope.row.type === 1 ? '菜单组件节点' : '路由/按钮权限' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创立时间点" width="180" />
      <el-table-column label="操作链" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" text @click="handleAddChild(scope.row)" v-if="scope.row.type === 1">增加子项</el-button>
          <el-button size="small" type="danger" text @click="handleDelete(scope.row)">抹除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗略简版 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="节点名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="鉴权编码" prop="code">
          <el-input v-model="form.code" placeholder="如 system:role:list" />
        </el-form-item>
        <el-form-item label="组件类型">
          <el-radio-group v-model="form.type">
            <el-radio :label="1">功能菜单</el-radio>
            <el-radio :label="2">按钮动作</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定录入</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPermissions, addPermission, updatePermission, deletePermission } from '../../api/system'

const loading = ref(false)
const tableData = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const typeMap = {
  1: '菜单',
  2: '按钮/接口'
}

const form = reactive({
  id: undefined,
  parent_id: null,
  name: '',
  code: '',
  type: 1,
  sort: 0
})

const rules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
}

// 扁平数组转树形结构
const buildTree = (data, parentId = 0) => {
  const result = []
  data.forEach(item => {
    if (item.parent_id === parentId) {
      const children = buildTree(data, item.id)
      if (children.length) {
        item.children = children
      }
      result.push(item)
    }
  })
  return result
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPermissions()
    if (res.code === 200) {
      // 假设后端直接返回了扁平数据，我们在前端构建树
      tableData.value = buildTree(JSON.parse(JSON.stringify(res.data)))
    }
  } catch (error) {
    ElMessage.error('获取权限列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = (row) => {
  isEdit.value = false
  dialogTitle.value = '新增权限节点'
  Object.assign(form, {
    id: undefined,
    parent_id: row ? row.id : 0,
    name: '',
    code: '',
    type: row ? 2 : 1, // 如果选了父级默认是按钮，否则是菜单
    sort: 0
  })
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑权限节点'
  Object.assign(form, row)
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleDelete = (row) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning('该节点下包含子节点，请先删除子节点！')
    return
  }
  ElMessageBox.confirm(`确认删除权限节点 [${row.name}] 吗？`, '危险操作', {
    type: 'error'
  }).then(async () => {
    try {
      await deletePermission(row.id)
      ElMessage.success('节点已删除')
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
          await updatePermission(form.id, form)
          ElMessage.success('节点已更新')
        } else {
          await addPermission(form)
          ElMessage.success('节点已创建')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
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
