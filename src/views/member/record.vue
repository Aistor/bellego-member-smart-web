<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>消费记账</span>
        <el-button type="primary" @click="handleAdd">新增消费记录</el-button>
      </div>
    </template>

    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="流水号ID" width="100" />
      <el-table-column label="会员姓名" width="120">
        <template #default="scope">
          {{ getMemberName(scope.row.member_id) }}
        </template>
      </el-table-column>
      <el-table-column label="消费门店" width="150">
        <template #default="scope">
          {{ getStoreName(scope.row.store_id) }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="消费金额(元)" width="120">
        <template #default="scope">
          <span style="color: #f56c6c; font-weight: bold;">￥{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="points_earned" label="获得积分" width="120">
        <template #default="scope">
          <span style="color: #67c23a;">+{{ scope.row.points_earned }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="consume_time" label="消费时间" min-width="160" />
    </el-table>

    <!-- 新增记账弹窗 -->
    <el-dialog title="新增消费记账" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="选择会员" prop="member_id">
          <el-select v-model="form.member_id" placeholder="请选择或搜索会员" filterable style="width: 100%">
            <el-option
              v-for="item in memberListOptions"
              :key="item.id"
              :label="`${item.name} (${item.phone})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消费门店" prop="store_id">
          <el-select v-model="form.store_id" placeholder="请选择消费门店" style="width: 100%">
            <el-option
              v-for="item in storeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消费金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0.01" :precision="2" :step="10" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定记账</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getConsumptions, addConsumption } from '../../api/member'

const loading = ref(false)
const tableData = ref([])

const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  member_id: '',
  store_id: 1, // 默认门店
  amount: 0,
  order_no: '',
  remark: ''
})

const rules = {
  member_id: [{ required: true, message: '请选择或输入会员ID', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入消费金额', trigger: 'blur' }],
  order_no: [{ required: true, message: '请输入订单号', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getConsumptions()
    if (res.code === 200) {
      tableData.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取消费记录失败')
  } finally {
    loading.value = false
  }
}

const getMemberName = (id) => {
  // 此处原逻辑为根据ID换取名字，实际业务应由后端直接返回会员名称或通过联查
  // 为简化展示，返回固定格式
  return `会员-${id}`
}

const getStoreName = (id) => {
  return id === 1 ? '总店' : `门店-${id}`
}

const handleAdd = () => {
  Object.assign(form, {
    member_id: '',
    store_id: 1,
    amount: 0,
    order_no: 'ORD' + Date.now(),
    remark: ''
  })
  dialogVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const submitForm = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      try {
        const res = await addConsumption(form)
        ElMessage.success(`记账成功！赠送积分: ${res.data.earnedPoints}`)
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '记账失败')
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
