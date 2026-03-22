<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>门店管理</span>
        <el-button type="primary" @click="openCreate">新增门店</el-button>
      </div>
    </template>

    <el-form :inline="true" :model="query" class="search-form">
      <el-form-item label="关键词">
        <el-input v-model="query.keyword" placeholder="名称/编码" clearable />
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
      <el-table-column prop="name" label="门店名称" min-width="180" />
      <el-table-column prop="code" label="门店编码" width="140" />
      <el-table-column prop="address" label="门店地址" min-width="220" />
      <el-table-column prop="phone" label="联系电话" width="150" />
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
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="removeStore(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑门店' : '新增门店'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="门店名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="门店编码" prop="code">
          <el-input v-model="form.code" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="门店地址" prop="address">
          <el-input v-model="form.address" type="textarea" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
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

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: ''
})

const form = reactive({
  id: '',
  name: '',
  code: '',
  address: '',
  phone: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入门店编码', trigger: 'blur' }],
  address: [{ required: true, message: '请输入门店地址', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const result = await getStores({
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
    name: '',
    code: '',
    address: '',
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
  Object.assign(form, { ...row })
  dialogVisible.value = true
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
  await updateStoreStatus(row.id, value)
  row.status = value
  ElMessage.success('状态更新成功')
}

async function removeStore(row) {
  await ElMessageBox.confirm(`确认删除门店“${row.name}”？`, '提示', { type: 'warning' })
  await deleteStore(row.id)
  ElMessage.success('删除成功')
  loadData()
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if (isEdit.value) {
      await updateStore(form.id, form)
      ElMessage.success('门店更新成功')
    } else {
      await createStore(form)
      ElMessage.success('门店创建成功')
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

.search-form {
  margin-bottom: 18px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
</style>
