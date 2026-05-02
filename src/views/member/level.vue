<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>会员等级</span>
        <el-button type="primary" @click="openCreate">新增等级</el-button>
      </div>
    </template>

    <el-table v-loading="loading" :data="tableData" max-height="60vh" border>
      <el-table-column prop="name" label="等级名称" min-width="140" />
      <el-table-column prop="level" label="等级值" width="100" />
      <el-table-column prop="minPoints" label="最低积分" width="120" />
      <el-table-column prop="minConsumption" label="最低消费" width="120" />
      <el-table-column prop="discountRate" label="折扣率" width="100" />
      <el-table-column prop="pointRate" label="积分倍率" width="100" />
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
          <el-button link type="danger" @click="removeLevel(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑等级' : '新增等级'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="等级值" prop="level">
          <el-input-number v-model="form.level" :min="1" />
        </el-form-item>
        <el-form-item label="最低积分" prop="minPoints">
          <el-input-number v-model="form.minPoints" :min="0" />
        </el-form-item>
        <el-form-item label="最低消费" prop="minConsumption">
          <el-input-number v-model="form.minConsumption" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="折扣率" prop="discountRate">
          <el-input-number v-model="form.discountRate" :min="0" :max="1" :step="0.01" :precision="2" />
        </el-form-item>
        <el-form-item label="积分倍率" prop="pointRate">
          <el-input-number v-model="form.pointRate" :min="0" :step="0.1" :precision="1" />
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
  createLevel,
  deleteLevel,
  getLevels,
  updateLevel,
  updateLevelStatus
} from '../../api/member'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: '',
  name: '',
  level: 1,
  minPoints: 0,
  minConsumption: 0,
  discountRate: 1,
  pointRate: 1,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  level: [{ required: true, message: '请输入等级值', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const result = await getLevels()
    tableData.value = result.data || []
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    id: '',
    name: '',
    level: 1,
    minPoints: 0,
    minConsumption: 0,
    discountRate: 1,
    pointRate: 1,
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
  await updateLevelStatus(row.id, value)
  row.status = value
  ElMessage.success('状态更新成功')
}

async function removeLevel(row) {
  await ElMessageBox.confirm(`确认删除等级“${row.name}”？`, '提示', {
    type: 'warning'
  })
  await deleteLevel(row.id)
  ElMessage.success('等级删除成功')
  loadData()
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if (isEdit.value) {
      await updateLevel(form.id, form)
      ElMessage.success('等级更新成功')
    } else {
      await createLevel(form)
      ElMessage.success('等级创建成功')
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
