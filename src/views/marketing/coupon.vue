<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>优惠券管理</span>
        <el-button type="primary" @click="openCreate">新增优惠券</el-button>
      </div>
    </template>

    <el-form :inline="true" :model="query" class="search-form">
      <el-form-item label="关键词">
        <el-input v-model="query.keyword" placeholder="优惠券名称" clearable />
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
      <el-table-column prop="name" label="优惠券名称" min-width="160" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">{{ couponTypeText(row.type) }}</template>
      </el-table-column>
      <el-table-column prop="couponValue" label="面值" width="120" />
      <el-table-column prop="useCondition" label="使用门槛" width="120" />
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column prop="totalIssued" label="已发放" width="100" />
      <el-table-column label="有效期" min-width="230">
        <template #default="{ row }">{{ row.startTime }} 至 {{ row.endTime }}</template>
      </el-table-column>
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
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="success" @click="openIssue(row)">发放</el-button>
          <el-button link type="danger" @click="removeCoupon(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑优惠券' : '新增优惠券'" width="620px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="满减券" :value="1" />
            <el-option label="折扣券" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="优惠值" prop="couponValue">
          <el-input-number v-model="form.couponValue" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="使用门槛">
          <el-input-number v-model="form.useCondition" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
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

    <el-dialog v-model="issueDialogVisible" title="发放优惠券" width="560px">
      <el-form ref="issueFormRef" :model="issueForm" :rules="issueRules" label-width="100px">
        <el-form-item label="优惠券">
          <span>{{ currentCoupon?.name || '-' }}</span>
        </el-form-item>
        <el-form-item label="发放方式" prop="issueAll">
          <el-radio-group v-model="issueForm.issueAll">
            <el-radio :value="false">指定会员</el-radio>
            <el-radio :value="true">全部启用会员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!issueForm.issueAll" label="指定会员" prop="memberIds">
          <el-select
            v-model="issueForm.memberIds"
            multiple
            filterable
            placeholder="请选择会员"
            style="width: 100%"
          >
            <el-option
              v-for="item in memberOptions"
              :key="item.id"
              :label="`${item.name} / ${item.phone}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="issueDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitIssue">确认发放</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMembers } from '../../api/member'
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  issueCoupon,
  updateCoupon,
  updateCouponStatus
} from '../../api/marketing'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const issueDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const issueFormRef = ref()
const currentCoupon = ref(null)
const memberOptions = ref([])

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: ''
})

const form = reactive({
  id: '',
  name: '',
  type: 1,
  couponValue: 0,
  useCondition: 0,
  stock: 1,
  startTime: '',
  endTime: '',
  status: 1
})

const issueForm = reactive({
  issueAll: false,
  memberIds: []
})

const rules = {
  name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  couponValue: [{ required: true, message: '请输入优惠值', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const issueRules = {
  memberIds: [
    {
      validator: (_, value, callback) => {
        if (issueForm.issueAll || (value && value.length)) {
          callback()
          return
        }
        callback(new Error('请选择要发放的会员'))
      },
      trigger: 'change'
    }
  ]
}

const couponTypeText = (type) => (Number(type) === 1 ? '满减券' : '折扣券')

async function loadMembers() {
  const result = await getMembers({ pageNum: 1, pageSize: 200 })
  memberOptions.value = result.data?.records || []
}

async function loadData() {
  loading.value = true
  try {
    const result = await getCoupons({
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
    type: 1,
    couponValue: 0,
    useCondition: 0,
    stock: 1,
    startTime: '',
    endTime: '',
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

function openIssue(row) {
  currentCoupon.value = row
  issueForm.issueAll = false
  issueForm.memberIds = []
  issueDialogVisible.value = true
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
  await updateCouponStatus(row.id, value)
  row.status = value
  ElMessage.success('状态更新成功')
}

async function removeCoupon(row) {
  await ElMessageBox.confirm(`确认删除优惠券“${row.name}”？`, '提示', {
    type: 'warning'
  })
  await deleteCoupon(row.id)
  ElMessage.success('删除成功')
  loadData()
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if (isEdit.value) {
      await updateCoupon(form.id, form)
      ElMessage.success('优惠券更新成功')
    } else {
      await createCoupon(form)
      ElMessage.success('优惠券创建成功')
    }
    dialogVisible.value = false
    loadData()
  })
}

function submitIssue() {
  issueFormRef.value.validate(async (valid) => {
    if (!valid || !currentCoupon.value) return
    await issueCoupon(currentCoupon.value.id, {
      issueAll: issueForm.issueAll,
      memberIds: issueForm.issueAll ? undefined : issueForm.memberIds
    })
    ElMessage.success('发放成功')
    issueDialogVisible.value = false
    loadData()
  })
}

onMounted(async () => {
  await Promise.all([loadData(), loadMembers()])
})
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
