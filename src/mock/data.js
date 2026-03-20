// --- 会员管理模块模拟数据 ---

// 会员表 (member)
export const memberList = [
    {
        id: 1,
        level_id: 2,
        card_number: 'VIP20231001001',
        name: '张三',
        phone: '13800138000',
        gender: 1,
        birthday: '1990-05-15',
        total_points: 1500,
        total_consumption: 5200.50,
        status: 1,
        create_time: '2023-10-01 10:00:00',
        update_time: '2023-10-01 10:00:00',
        last_consume_time: '2024-03-05 14:30:00'
    },
    {
        id: 2,
        level_id: 1,
        card_number: 'VIP20231115002',
        name: '李四',
        phone: '13900139000',
        gender: 2,
        birthday: '1985-08-20',
        total_points: 300,
        total_consumption: 800.00,
        status: 1,
        create_time: '2023-11-15 09:20:00',
        update_time: '2023-11-15 09:20:00',
        last_consume_time: '2024-02-28 18:15:00'
    },
    {
        id: 3,
        level_id: 3,
        card_number: 'VIP20220501003',
        name: '王五',
        phone: '13700137000',
        gender: 1,
        birthday: '1978-12-05',
        total_points: 8500,
        total_consumption: 25600.00,
        status: 1,
        create_time: '2022-05-01 11:10:00',
        update_time: '2024-01-10 16:00:00',
        last_consume_time: '2024-03-08 09:45:00'
    },
    {
        id: 4,
        level_id: 1,
        card_number: 'VIP20240101004',
        name: '赵六',
        phone: '13600136000',
        gender: 2,
        birthday: '2000-03-25',
        total_points: 50,
        total_consumption: 150.00,
        status: 0, // 禁用状态
        create_time: '2024-01-01 14:00:00',
        update_time: '2024-02-01 10:00:00',
        last_consume_time: '2024-01-05 12:00:00'
    }
]

// 会员等级表 (member_level)
export const memberLevelList = [
    {
        id: 1,
        name: '普通会员',
        level: 1,
        min_points: 0,
        min_consumption: 0.00,
        discount_rate: 1.00,
        point_rate: 1,
        status: 1,
        create_time: '2022-01-01 00:00:00'
    },
    {
        id: 2,
        name: '黄金会员',
        level: 2,
        min_points: 1000,
        min_consumption: 3000.00,
        discount_rate: 0.95,
        point_rate: 1.5,
        status: 1,
        create_time: '2022-01-01 00:00:00'
    },
    {
        id: 3,
        name: '钻石会员',
        level: 3,
        min_points: 5000,
        min_consumption: 10000.00,
        discount_rate: 0.88,
        point_rate: 2,
        status: 1,
        create_time: '2022-01-01 00:00:00'
    }
]

// 消费记录表 (consumption_record)
export const consumptionRecordList = [
    {
        id: 1,
        member_id: 1,
        store_id: 1,
        amount: 150.50,
        points_earned: 225, // 黄金会员 1.5倍积分
        consume_time: '2024-03-05 14:30:00',
        create_time: '2024-03-05 14:30:00'
    },
    {
        id: 2,
        member_id: 3,
        store_id: 2,
        amount: 500.00,
        points_earned: 1000, // 钻石会员 2倍积分
        consume_time: '2024-03-08 09:45:00',
        create_time: '2024-03-08 09:45:00'
    },
    {
        id: 3,
        member_id: 2,
        store_id: 1,
        amount: 80.00,
        points_earned: 80, // 普通会员 1倍积分
        consume_time: '2024-02-28 18:15:00',
        create_time: '2024-02-28 18:15:00'
    }
]


// --- 营销模块模拟数据 ---

// 卡券表 (coupon)
export const couponList = [
    {
        id: 1,
        name: '满100减10元优惠券',
        type: 2, // 2-满减券
        value: 10.00,
        condition: 100.00,
        stock: 1000,
        total_issued: 350,
        start_time: '2024-03-01 00:00:00',
        end_time: '2024-03-31 23:59:59',
        status: 1,
        create_time: '2024-02-28 10:00:00'
    },
    {
        id: 2,
        name: '全场9折券',
        type: 1, // 1-折扣券
        value: 0.90,
        condition: 0.00,
        stock: 500,
        total_issued: 500,
        start_time: '2024-03-08 00:00:00',
        end_time: '2024-03-08 23:59:59',
        status: 1,
        create_time: '2024-03-05 15:00:00'
    }
]

// 会员卡券表 (member_coupon)
export const memberCouponList = [
    {
        id: 1,
        member_id: 1,
        coupon_id: 1,
        code: 'CPN2403010001',
        status: 0, // 0-未使用
        receive_time: '2024-03-02 10:00:00',
        use_time: null,
        expire_time: '2024-03-31 23:59:59'
    },
    {
        id: 2,
        member_id: 3,
        coupon_id: 2,
        code: 'CPN2403080001',
        status: 1, // 1-已使用
        receive_time: '2024-03-08 08:00:00',
        use_time: '2024-03-08 09:45:00',
        expire_time: '2024-03-08 23:59:59'
    }
]

// 积分规则表 (point_rule)
export const pointRuleList = [
    {
        id: 1,
        rule_name: '日常消费积分',
        rule_type: 1, // 1-消费积分
        applicable_level_id: null, // 空表示通用
        points_per_unit: 1,
        min_amount: 1.00,
        max_points: 10000,
        status: 1,
        create_time: '2022-01-01 00:00:00'
    },
    {
        id: 2,
        rule_name: '每日签到赠送',
        rule_type: 2, // 2-签到积分
        applicable_level_id: null,
        points_per_unit: 10,
        min_amount: 0.00,
        max_points: 10,
        status: 1,
        create_time: '2023-05-01 00:00:00'
    }
]

// 积分明细表 (point_detail)
export const pointDetailList = [
    {
        id: 1,
        member_id: 1,
        type: 1, // 1-获取
        points: 225,
        balance: 1500,
        source: '消费',
        source_id: 1,
        remark: '线下门店消费获得积分',
        create_time: '2024-03-05 14:30:00'
    },
    {
        id: 2,
        member_id: 1,
        type: 2, // 2-消耗
        points: -500,
        balance: 1275, // 假设之前的余额
        source: '兑换',
        source_id: null,
        remark: '积分商城兑换礼品',
        create_time: '2024-02-15 10:00:00'
    }
]

// --- 系统管理模块模拟数据 ---

// 门店表 (store)
export const storeList = [
    {
        id: 1,
        name: '生鲜超市(总店)',
        code: 'ST001',
        address: '市中心北京路1号',
        phone: '010-88888888',
        status: 1,
        create_time: '2020-01-01 00:00:00'
    },
    {
        id: 2,
        name: '生鲜超市(高新区分店)',
        code: 'ST002',
        address: '高新区科技路88号',
        phone: '010-66666666',
        status: 1,
        create_time: '2021-06-01 00:00:00'
    }
]

// 操作日志表 (operation_log)
export const operationLogList = [
    {
        id: 1,
        operator_id: 1,
        operator_name: 'admin',
        module: '会员管理',
        operation: '新增会员',
        detail: '{"name":"赵六","phone":"13600136000"}',
        ip: '192.168.1.100',
        create_time: '2024-01-01 14:00:00'
    },
    {
        id: 2,
        operator_id: 1,
        operator_name: 'admin',
        module: '系统管理',
        operation: '禁用管理员',
        detail: '{"id":2,"status":0}',
        ip: '192.168.1.100',
        create_time: '2024-03-07 09:15:00'
    }
]

// 管理员表 (admin)
export const adminList = [
    {
        id: 1,
        username: 'admin',
        password: '加密后的密码',
        real_name: '超级管理员',
        phone: '13888888888',
        status: 1,
        create_time: '2022-01-01 00:00:00'
    },
    {
        id: 2,
        username: 'manager_01',
        password: '加密后的密码',
        real_name: '店长A',
        phone: '13999999999',
        status: 1,
        create_time: '2023-01-01 00:00:00'
    }
]

// 角色表 (role)
export const roleList = [
    {
        id: 1,
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        description: '系统最高权限',
        create_time: '2022-01-01 00:00:00'
    },
    {
        id: 2,
        name: '店长',
        code: 'STORE_MANAGER',
        description: '负责门店日常运营与会员管理',
        create_time: '2022-01-01 00:00:00'
    }
]

// 权限表 (permission)
export const permissionList = [
    { id: 1, name: '会员管理', code: 'member', type: 1, parent_id: 0, create_time: '2022-01-01' },
    { id: 2, name: '会员列表查询', code: 'member:list', type: 2, parent_id: 1, create_time: '2022-01-01' },
    { id: 3, name: '增加会员', code: 'member:add', type: 2, parent_id: 1, create_time: '2022-01-01' },
    { id: 4, name: '营销管理', code: 'marketing', type: 1, parent_id: 0, create_time: '2022-01-01' }
]
