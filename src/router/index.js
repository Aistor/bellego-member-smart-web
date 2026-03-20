import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('../layout/index.vue'),
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('../views/dashboard/index.vue'),
                meta: { title: '首页', icon: 'HomeFilled' }
            },
            // 会员管理
            {
                path: 'member/list',
                name: 'MemberList',
                component: () => import('../views/member/list.vue'),
                meta: { title: '会员列表', icon: 'User' }
            },
            {
                path: 'member/level',
                name: 'MemberLevel',
                component: () => import('../views/member/level.vue'),
                meta: { title: '会员等级', icon: 'Star' }
            },
            {
                path: 'member/record',
                name: 'MemberRecord',
                component: () => import('../views/member/record.vue'),
                meta: { title: '消费记账', icon: 'Money' }
            },
            // 营销
            {
                path: 'marketing/coupon',
                name: 'Coupon',
                component: () => import('../views/marketing/coupon.vue'),
                meta: { title: '卡券管理', icon: 'Ticket' }
            },
            {
                path: 'marketing/member-coupon',
                name: 'MemberCoupon',
                component: () => import('../views/marketing/member-coupon.vue'),
                meta: { title: '会员卡券', icon: 'Present' }
            },
            {
                path: 'marketing/point-rule',
                name: 'PointRule',
                component: () => import('../views/marketing/point-rule.vue'),
                meta: { title: '积分规则', icon: 'Setting' }
            },
            {
                path: 'marketing/point-detail',
                name: 'PointDetail',
                component: () => import('../views/marketing/point-detail.vue'),
                meta: { title: '积分明细', icon: 'List' }
            },
            // 分析
            {
                path: 'analysis/rfm',
                name: 'AnalysisRFM',
                component: () => import('../views/analysis/rfm.vue'),
                meta: { title: 'RFM分析', icon: 'PieChart' }
            },
            {
                path: 'analysis/lifecycle',
                name: 'AnalysisLifecycle',
                component: () => import('../views/analysis/lifecycle.vue'),
                meta: { title: '生命周期分析', icon: 'TrendCharts' }
            },
            {
                path: 'analysis/behavior',
                name: 'AnalysisBehavior',
                component: () => import('../views/analysis/behavior.vue'),
                meta: { title: '消费行为分析', icon: 'DataLine' }
            },
            // 系统
            {
                path: 'system/store',
                name: 'SystemStore',
                component: () => import('../views/system/store.vue'),
                meta: { title: '多门店管理', icon: 'Shop' }
            },
            {
                path: 'system/log',
                name: 'SystemLog',
                component: () => import('../views/system/log.vue'),
                meta: { title: '操作日志', icon: 'Document' }
            },
            {
                path: 'system/admin',
                name: 'SystemAdmin',
                component: () => import('../views/system/admin.vue'),
                meta: { title: '管理员管理', icon: 'Avatar' }
            },
            {
                path: 'system/role',
                name: 'SystemRole',
                component: () => import('../views/system/role.vue'),
                meta: { title: '角色管理', icon: 'Lock' }
            },
            {
                path: 'system/permission',
                name: 'SystemPermission',
                component: () => import('../views/system/permission.vue'),
                meta: { title: '权限管理', icon: 'Key' }
            }
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/login/index.vue'),
        meta: { title: '登录' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (!token && to.path !== '/login') {
        next('/login')
    } else if (token && to.path === '/login') {
        next('/')
    } else {
        next()
    }
})

export default router
