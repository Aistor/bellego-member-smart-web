<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>积分规则</span>
        <el-button type="primary" @click="openCreate">新增规则</el-button>
      </div>
    </template>

    <el-table v-loading="loading" :data="tableData" border show-overflow-tooltip stripe>
      <el-table-column prop="ruleName" label="规则名称" min-width="160" />
      <el-table-column label="适用等级" width="140">
        <template #default="{ row }">{{ levelName(row.applicableLevelId) }}</template>
      </el-table-column>
      <el-table-column prop="pointsPerUnit" label="每单位积分" width="120" />
      <el-table-column prop="minAmount" label="最低参与金额" width="130" />
      <el-table-column prop="maxPoints" label="单次积分上限" width="130" />
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
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="removeRule(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑规则' : '新增规则'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="form.ruleName" />
        </el-form-item>
        <el-form-item label="适用等级">
          <el-select v-model="form.applicableLevelId" clearable placeholder="为空表示通用" style="width: 100%">
            <el-option
              v-for="item in levelOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="每单位积分" prop="pointsPerUnit">
          <el-input-number v-model="form.pointsPerUnit" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="最低参与金额">
          <el-input-number v-model="form.minAmount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单次积分上限">
          <el-input-number v-model="form.maxPoints" :min="0" style="width: 100%" />
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
import { getLevels } from '../../api/member'
import {
  createPointRule,
  deletePointRule,
  getPointRules,
  updatePointRule,
  updatePointRuleStatus
} from '../../api/marketing'

const loading = ref(false)
const tableData = ref([])
const levelOptions = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: '',
  ruleName: '',
  ruleType: 1,
  applicableLevelId: '',
  pointsPerUnit: 1,
  minAmount: 0,
  maxPoints: 0,
  status: 1
})

const rules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  pointsPerUnit: [{ required: true, message: '请输入每单位积分', trigger: 'blur' }]
}

const levelName = (id) => levelOptions.value.find((item) => item.id === id)?.name || '通用'

async function loadOptions() {
  const result = await getLevels()
  const data = result.data
  levelOptions.value = Array.isArray(data) ? data : data?.records || []
}

async function loadData() {
  loading.value = true
  try {
    const result = await getPointRules()
    const data = result.data
    tableData.value = Array.isArray(data) ? data : data?.records || []
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    id: '',
    ruleName: '',
    ruleType: 1,
    applicableLevelId: '',
    pointsPerUnit: 1,
    minAmount: 0,
    maxPoints: 0,
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

async function changeStatus(row, value) {
  await updatePointRuleStatus(row.id, value)
  row.status = value
  ElMessage.success('状态更新成功')
}

async function removeRule(row) {
  await ElMessageBox.confirm(`确认删除规则“${row.ruleName}”？`, '提示', { type: 'warning' })
  await deletePointRule(row.id)
  ElMessage.success('删除成功')
  loadData()
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    const payload = {
      ...form,
      applicableLevelId: form.applicableLevelId || undefined
    }
    if (isEdit.value) {
      await updatePointRule(form.id, payload)
      ElMessage.success('规则更新成功')
    } else {
      await createPointRule(payload)
      ElMessage.success('规则创建成功')
    }
    dialogVisible.value = false
    loadData()
  })
}

onMounted(async () => {
  await Promise.all([loadData(), loadOptions()])
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
