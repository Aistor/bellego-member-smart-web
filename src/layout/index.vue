<template>
  <div class="app-wrapper">
    <el-container class="layout-container">
      <el-aside width="200px" class="aside">
        <h2 class="logo">超市管理系统</h2>
        <el-menu
          router
          :default-active="$route.path"
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          
          <el-sub-menu index="/member">
            <template #title>
              <el-icon><UserFilled /></el-icon>
              <span>基础会员管理</span>
            </template>
            <el-menu-item index="/member/list">会员列表</el-menu-item>
            <el-menu-item index="/member/level">会员等级</el-menu-item>
            <el-menu-item index="/member/record">消费记账</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/marketing">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>营销模块</span>
            </template>
            <el-menu-item index="/marketing/coupon">卡券管理</el-menu-item>
            <el-menu-item index="/marketing/member-coupon">会员卡券</el-menu-item>
            <el-menu-item index="/marketing/point-rule">积分规则</el-menu-item>
            <el-menu-item index="/marketing/point-detail">积分明细</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/analysis">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>会员分析</span>
            </template>
            <el-menu-item index="/analysis/rfm">RFM模型分析</el-menu-item>
            <el-menu-item index="/analysis/lifecycle">生命周期分析</el-menu-item>
            <el-menu-item index="/analysis/behavior">消费行为分析</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/store">多门店管理</el-menu-item>
            <el-menu-item index="/system/log">操作日志</el-menu-item>
            <el-menu-item index="/system/admin">管理员管理</el-menu-item>
            <el-menu-item index="/system/role">角色管理</el-menu-item>
            <el-menu-item index="/system/permission">权限管理</el-menu-item>
          </el-sub-menu>

        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-content">欢迎使用会员管理系统</div>
          <div class="header-actions">
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link" style="cursor: pointer; display: flex; align-items: center;">
                admin <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ArrowDown, HomeFilled, UserFilled, Goods, DataAnalysis, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.app-wrapper, .layout-container {
  height: 100vh;
  width: 100vw;
}
.aside {
  background-color: #304156;
}
.logo {
  color: #fff;
  text-align: center;
  line-height: 60px;
  margin: 0;
  font-size: 18px;
  background-color: #2b3643;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.main {
  background-color: #f0f2f5;
  padding: 20px;
  box-sizing: border-box;
}
</style>
