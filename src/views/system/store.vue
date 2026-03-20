<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>多门店管理</span>
        <el-button type="primary" @click="handleAdd">新增门店</el-button>
      </div>
    </template>

    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="门店名称" width="200" />
      <el-table-column prop="code" label="门店编码" width="120" />
      <el-table-column prop="address" label="地址" min-width="250" />
      <el-table-column prop="phone" label="联系电话" width="150" />
      <el-table-column label="状态" width="80">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="门店名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入门店名称" />
        </el-form-item>
        <el-form-item label="门店编码" prop="code">
          <el-input v-model="form.code" placeholder="系统唯一编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input type="textarea" v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="门店联系方式" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getStores, addStore, updateStore, deleteStore, updateStoreStatus } from '../../api/system'

const loading = ref(false)
const tableData = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const form = reactive({
  id: undefined,
  name: '',
  address: '',
  manager: '',
  phone: ''
})

const rules = {
  name: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
  manager: [{ required: true, message: '请输入店长姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getStores()
    if (res.code === 200) {
      tableData.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取门店列表失败')
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (row) => {
  try {
    await updateStoreStatus(row.id, row.status)
    ElMessage.success(`已${row.status === 1 ? '启用' : '停用'}门店: ${row.name}`)
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error(error.message || '操作失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增门店'
  Object.assign(form, {
    id: undefined,
    name: '',
    address: '',
    manager: '',
    phone: ''
  })
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑门店'
  Object.assign(form, row)
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除门店 [${row.name}] 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteStore(row.id)
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
          await updateStore(form.id, form)
          ElMessage.success('修改成功')
        } else {
          await addStore(form)
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
