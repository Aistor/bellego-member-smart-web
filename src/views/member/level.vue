<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">会员等级</h2>
      </div>
      <el-button type="primary" @click="openDialog()">新增等级</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe>
      <el-table-column prop="name" label="等级名称" min-width="140" />
      <el-table-column prop="level" label="等级值" min-width="100" />
      <el-table-column prop="minPoints" label="最低积分" min-width="120" />
      <el-table-column label="最低消费" min-width="120">
        <template #default="{ row }">¥ {{ formatCurrency(row.minConsumption) }}</template>
      </el-table-column>
      <el-table-column prop="discountRate" label="折扣率" min-width="100" />
      <el-table-column prop="pointRate" label="积分倍率" min-width="100" />
      <el-table-column label="状态" min-width="90">
        <template #default="{ row }">
          <el-switch :model-value="row.status" :active-value="1" :inactive-value="0" @change="(value) => changeStatus(row, value)" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="180" />
      <el-table-column label="操作" fixed="right" min-width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑等级' : '新增等级'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="等级名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="等级值" prop="level"><el-input-number v-model="form.level" :min="1" style="width: 100%" /></el-form-item>
        <el-form-item label="最低积分" prop="minPoints"><el-input-number v-model="form.minPoints" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="最低消费" prop="minConsumption"><el-input-number v-model="form.minConsumption" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="折扣率" prop="discountRate"><el-input-number v-model="form.discountRate" :min="0" :max="10" :step="0.1" style="width: 100%" /></el-form-item>
        <el-form-item label="积分倍率" prop="pointRate"><el-input-number v-model="form.pointRate" :min="0" :step="0.1" style="width: 100%" /></el-form-item>
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
  createLevel,
  deleteLevel,
  getLevels,
  updateLevel,
  updateLevelStatus
} from '../../api/member'
import { formatCurrency } from '../../utils/format'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const editingId = ref('')
const rows = ref([])

const createDefaultForm = () => ({
  name: '',
  level: 1,
  minPoints: 0,
  minConsumption: 0,
  discountRate: 1,
  pointRate: 1,
  status: 1
})

const form = reactive(createDefaultForm())

const rules = {
  name: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  level: [{ required: true, message: '请输入等级值', trigger: 'change' }],
  minPoints: [{ required: true, message: '请输入最低积分', trigger: 'change' }],
  minConsumption: [{ required: true, message: '请输入最低消费', trigger: 'change' }],
  discountRate: [{ required: true, message: '请输入折扣率', trigger: 'change' }],
  pointRate: [{ required: true, message: '请输入积分倍率', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await getLevels()
    rows.value = response.data || []
  } finally {
    loading.value = false
  }
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
      await updateLevel(editingId.value, form)
      ElMessage.success('等级已更新')
    } else {
      await createLevel(form)
      ElMessage.success('等级已创建')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

const changeStatus = async (row, status) => {
  await updateLevelStatus(row.id, status)
  row.status = status
  ElMessage.success('状态已更新')
}

const remove = async (id) => {
  await ElMessageBox.confirm('删除后不可恢复，是否继续？', '删除等级', { type: 'warning' })
  await deleteLevel(id)
  ElMessage.success('等级已删除')
  loadData()
}

onMounted(loadData)
</script>
