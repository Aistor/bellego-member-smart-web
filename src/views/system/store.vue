<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">门店管理</h2>
      </div>
      <el-button type="primary" @click="openDialog()">新增门店</el-button>
    </div>

    <div class="toolbar">
      <el-input v-model="query.keyword" placeholder="名称 / 编码" clearable style="width: 220px" />
      <el-select v-model="query.status" clearable placeholder="状态" style="width: 140px">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe show-overflow-tooltip>
      <el-table-column prop="name" label="门店名称" min-width="160" />
      <el-table-column prop="code" label="门店编码" min-width="120" />
      <el-table-column prop="address" label="地址" min-width="240" />
      <el-table-column prop="phone" label="电话" min-width="140" />
      <el-table-column prop="createTime" label="创建时间" min-width="180" />
      <el-table-column label="状态" min-width="70">
        <template #default="{ row }">
          <el-switch :model-value="row.status" :active-value="1" :inactive-value="0" @change="(value) => changeStatus(row, value)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" min-width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑门店' : '新增门店'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="编码" prop="code"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="地址" prop="address"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="电话" prop="phone"><el-input v-model="form.phone" /></el-form-item>
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
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createStore,
  deleteStore,
  getStores,
  updateStore,
  updateStoreStatus
} from '../../api/system'
import { normalizePageData } from '../../utils/format'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const editingId = ref('')
const rows = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: undefined
})

const createDefaultForm = () => ({
  name: '',
  code: '',
  address: '',
  phone: '',
  status: 1
})

const form = reactive(createDefaultForm())

const rules = {
  name: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入门店编码', trigger: 'blur' }],
  address: [{ required: true, message: '请输入门店地址', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入门店电话', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await getStores(query)
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
  dialogVisible.value = true
}

const submit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (editingId.value) {
      await updateStore(editingId.value, form)
      ElMessage.success('门店已更新')
    } else {
      await createStore(form)
      ElMessage.success('门店已创建')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

const changeStatus = async (row, status) => {
  await updateStoreStatus(row.id, status)
  row.status = status
  ElMessage.success('状态已更新')
}

const remove = async (id) => {
  await ElMessageBox.confirm('删除后不可恢复，是否继续？', '删除门店', { type: 'warning' })
  await deleteStore(id)
  ElMessage.success('门店已删除')
  loadData()
}

onMounted(loadData)
</script>
