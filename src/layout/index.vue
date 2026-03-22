<template>
  <el-container class="layout-shell">
    <el-aside class="layout-aside" width="240px">
      <div class="brand">
        <div class="brand-mark">B</div>
        <div>
          <div class="brand-title">Bellego</div>
          <div class="brand-subtitle">百乐购超市会员智管系统</div>
        </div>
      </div>

      <el-scrollbar class="aside-scrollbar">
        <el-menu
          router
          :default-active="$route.path"
          class="layout-menu"
          background-color="transparent"
          text-color="#d7e1f1"
          active-text-color="#ffffff"
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>工作台</span>
          </el-menu-item>

          <el-sub-menu index="/member">
            <template #title>
              <el-icon><UserFilled /></el-icon>
              <span>会员管理</span>
            </template>
            <el-menu-item index="/member/list">会员列表</el-menu-item>
            <el-menu-item index="/member/level">会员等级</el-menu-item>
            <el-menu-item index="/member/record">消费记录</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/marketing">
            <template #title>
              <el-icon><Ticket /></el-icon>
              <span>营销管理</span>
            </template>
            <el-menu-item index="/marketing/coupon">优惠券管理</el-menu-item>
            <el-menu-item index="/marketing/member-coupon">会员优惠券</el-menu-item>
            <el-menu-item index="/marketing/point-rule">积分规则</el-menu-item>
            <el-menu-item index="/marketing/point-detail">积分明细</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/analysis">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>分析模块</span>
            </template>
            <el-menu-item index="/analysis/rfm">RFM 分析</el-menu-item>
            <el-menu-item index="/analysis/lifecycle">生命周期分析</el-menu-item>
            <el-menu-item index="/analysis/behavior">消费行为分析</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/store">门店管理</el-menu-item>
            <el-menu-item index="/system/log">操作日志</el-menu-item>
            <el-menu-item index="/system/admin">管理员管理</el-menu-item>
            <el-menu-item index="/system/role">角色管理</el-menu-item>
            <el-menu-item index="/system/permission">权限管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div>
          <div class="header-title">{{ currentTitle }}</div>
        </div>

        <el-dropdown @command="handleCommand">
          <div class="user-box">
            <el-avatar :size="32">{{ userInitial }}</el-avatar>
            <div>
              <div class="user-name">{{ displayName }}</div>
              <div class="user-role">{{ userStore.profile?.username || 'admin' }}</div>
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  DataAnalysis,
  House,
  Setting,
  Ticket,
  UserFilled
} from '@element-plus/icons-vue'
import { logout } from '../api/system'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const currentTitle = computed(() => route.meta?.title || '工作台')
const displayName = computed(
  () => userStore.profile?.realName || userStore.profile?.username || '管理员'
)
const userInitial = computed(() => displayName.value.slice(0, 1))

async function handleCommand(command) {
  if (command !== 'logout') return

  try {
    await logout()
  } catch (error) {
    // 后端退出是幂等流程，这里失败也允许本地退出
  }

  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.layout-shell {
  min-height: 100vh;
  background: #edf2f7;
}

.layout-aside {
  background: linear-gradient(180deg, #17324d 0%, #102539 100%);
  color: #fff;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 18px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 700;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
}

.brand-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.68);
}

.layout-menu {
  border-right: 0;
  padding: 8px 10px 24px;
}

.aside-scrollbar {
  height: calc(100vh - 82px);
}

:deep(.aside-scrollbar .el-scrollbar__bar) {
  display: none;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.header-title {
  font-size: 22px;
  font-weight: 700;
  color: #14213d;
}

.header-subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

.user-box {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.user-name {
  color: #0f172a;
  font-weight: 600;
}

.user-role {
  color: #64748b;
  font-size: 12px;
}

.layout-main {
  padding: 24px;
}
</style>
