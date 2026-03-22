<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">积分规则</h2>
      </div>
      <el-button type="primary" @click="openDialog()">新增规则</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe show-overflow-tooltip>
      <el-table-column prop="ruleName" label="规则名称" min-width="160" />
      <el-table-column prop="ruleType" label="规则类型" min-width="100">
        <template #default="{ row }">
          <span v-if="row.ruleType === 1">消费积分</span>
          <span v-else-if="row.ruleType === 2">签到积分</span>
          <span v-else>其他</span>
        </template>
      </el-table-column>
      <el-table-column prop="applicableLevelId" label="适用等级 ID" min-width="130" />
      <el-table-column prop="pointsPerUnit" label="每单位金额积分数" min-width="100" />
      <el-table-column prop="minAmount" label="最低金额" min-width="80" />
      <el-table-column prop="maxPoints" label="单次上限" min-width="80" />
      <el-table-column label="状态" min-width="90">
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑规则' : '新增规则'" width="620px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="规则名称" prop="ruleName"><el-input v-model="form.ruleName" /></el-form-item>
        <el-form-item label="规则类型" prop="ruleType"><el-input-number v-model="form.ruleType" :min="1" style="width: 100%" /></el-form-item>
        <el-form-item label="适用等级 ID"><el-input v-model="form.applicableLevelId" placeholder="为空表示通用" /></el-form-item>
        <el-form-item label="每单位金额积分数" prop="pointsPerUnit"><el-input-number v-model="form.pointsPerUnit" :min="0" :precision="2" style="width: 100%" /></el-form-item>
        <el-form-item label="最低金额"><el-input-number v-model="form.minAmount" :min="0" :precision="2" style="width: 100%" /></el-form-item>
        <el-form-item label="单次积分上限"><el-input-number v-model="form.maxPoints" :min="0" style="width: 100%" /></el-form-item>
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
  createPointRule,
  deletePointRule,
  getPointRules,
  updatePointRule,
  updatePointRuleStatus
} from '../../api/marketing'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const editingId = ref('')
const rows = ref([])

const createDefaultForm = () => ({
  ruleName: '',
  ruleType: 1,
  applicableLevelId: '',
  pointsPerUnit: 1,
  minAmount: 0,
  maxPoints: 0,
  status: 1
})

const form = reactive(createDefaultForm())

const rules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  ruleType: [{ required: true, message: '请输入规则类型', trigger: 'change' }],
  pointsPerUnit: [{ required: true, message: '请输入积分数', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await getPointRules()
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
      await updatePointRule(editingId.value, form)
      ElMessage.success('规则已更新')
    } else {
      await createPointRule(form)
      ElMessage.success('规则已创建')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

const changeStatus = async (row, status) => {
  await updatePointRuleStatus(row.id, status)
  row.status = status
  ElMessage.success('状态已更新')
}

const remove = async (id) => {
  await ElMessageBox.confirm('删除后不可恢复，是否继续？', '删除规则', { type: 'warning' })
  await deletePointRule(id)
  ElMessage.success('规则已删除')
  loadData()
}

onMounted(loadData)
</script>
