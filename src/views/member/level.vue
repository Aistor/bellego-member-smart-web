<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>会员等级管理</span>
        <el-button type="primary" @click="handleAdd">新增等级</el-button>
      </div>
    </template>

    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="等级名称" width="120" />
      <el-table-column prop="level" label="等级数值" width="100" />
      <el-table-column prop="min_points" label="最小积分要求" width="120" />
      <el-table-column prop="min_consumption" label="最小消费要求(元)" width="150" />
      <el-table-column prop="discount_rate" label="折扣率" width="100" />
      <el-table-column prop="point_rate" label="积分倍率" width="100" />
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
      <el-table-column label="操作" min-width="150" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="130px">
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：白银会员" />
        </el-form-item>
        <el-form-item label="等级数值" prop="level">
          <el-input-number v-model="form.level" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="所需最小积分" prop="min_points">
          <el-input-number v-model="form.min_points" :min="0" />
        </el-form-item>
        <el-form-item label="所需最小消费" prop="min_consumption">
          <el-input-number v-model="form.min_consumption" :min="0" :precision="2" :step="100" />
        </el-form-item>
        <el-form-item label="折扣率" prop="discount_rate">
          <el-input-number v-model="form.discount_rate" :min="0.01" :max="1" :precision="2" :step="0.05" />
          <div class="form-tip">示例: 0.95表示95折，1表示无折扣</div>
        </el-form-item>
        <el-form-item label="积分倍率" prop="point_rate">
          <el-input-number v-model="form.point_rate" :min="0.1" :max="10" :precision="1" :step="0.5" />
          <div class="form-tip">示例: 1.5表示消费1元累积1.5分</div>
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
import { getLevels, addLevel, updateLevel, deleteLevel, updateLevelStatus } from '../../api/member'

const loading = ref(false)
const tableData = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const form = reactive({
  id: undefined,
  name: '',
  level: 1,
  min_points: 0,
  min_consumption: 0,
  discount_rate: 1,
  point_rate: 1
})

const rules = {
  name: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  level: [{ required: true, message: '请输入等级数值', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getLevels()
    if (res.code === 200) {
      tableData.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取等级列表失败')
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (row) => {
  try {
    await updateLevelStatus(row.id, row.status)
    ElMessage.success(`已${row.status === 1 ? '启用' : '禁用'}等级: ${row.name}`)
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error(error.message || '操作失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增等级'
  Object.assign(form, {
    id: undefined,
    name: '',
    level: tableData.value.length + 1,
    min_points: 0,
    min_consumption: 0,
    discount_rate: 1,
    point_rate: 1
  })
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑等级'
  Object.assign(form, row)
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除等级 [${row.name}] 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteLevel(row.id)
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
          await updateLevel(form.id, form)
          ElMessage.success('修改成功')
        } else {
          await addLevel(form)
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
.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
  margin-top: 4px;
}
</style>
