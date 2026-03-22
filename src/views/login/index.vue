<template>
  <div class="login-page">
    <div class="login-panel">
      <div class="login-copy">
        <div class="eyebrow">Bellego Admin</div>
        <h1>百乐购超市会员智管系统</h1>
      </div>

      <el-card class="login-card" shadow="never">
        <template #header>
          <div class="card-head">
            <span>管理员登录</span>
          </div>
        </template>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              placeholder="请输入密码"
              :prefix-icon="Lock"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-button type="primary" :loading="loading" class="submit-btn" @click="handleLogin">
            登录
          </el-button>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { login } from '../../api/system'
import { useUserStore } from '../../store/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: 'BLG123456'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function handleLogin() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const result = await login(form)
      userStore.setLoginState(result.data)
      ElMessage.success('登录成功')
      router.push('/')
    } catch (error) {
      // 统一拦截器已处理提示
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(245, 158, 11, 0.18), transparent 32%),
    radial-gradient(circle at bottom right, rgba(14, 116, 144, 0.22), transparent 30%),
    linear-gradient(135deg, #0f172a 0%, #11263c 45%, #19324a 100%);
}

.login-panel {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 420px;
  gap: 28px;
  align-items: center;
}

.login-copy {
  color: #fff;
  padding-right: 24px;
}

.eyebrow {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-copy h1 {
  margin: 18px 0 12px;
  font-size: clamp(32px, 6vw, 54px);
  line-height: 1.05;
}

.login-copy p {
  max-width: 420px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.78);
}

.login-card {
  border: 0;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
}

.card-head small {
  color: #64748b;
  font-weight: 500;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}

@media (max-width: 900px) {
  .login-panel {
    grid-template-columns: 1fr;
  }

  .login-copy {
    padding-right: 0;
  }
}
</style>
