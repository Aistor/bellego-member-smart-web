<template>
  <div class="analysis-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="data-card">
          <div class="card-title">重要价值会员 (VIP)</div>
          <div class="card-value">124 <span class="card-unit">人</span></div>
          <div class="card-desc">近期有消费，频次高，金额大</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <div class="card-title">重要保持会员</div>
          <div class="card-desc">近期无消费，频次高，金额大</div>
          <div class="card-value" style="color: #e6a23c">89 <span class="card-unit">人</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <div class="card-title">重要发展会员</div>
          <div class="card-desc">近期有消费，频次低，金额大</div>
          <div class="card-value" style="color: #67c23a">215 <span class="card-unit">人</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <div class="card-title">重要挽留会员</div>
          <div class="card-desc">近期无消费，频次低，金额大</div>
          <div class="card-value" style="color: #f56c6c">56 <span class="card-unit">人</span></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>RFM 会员价值分布散点图</span>
        </div>
      </template>
      <div ref="chartRef" style="width: 100%; height: 500px;"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getRfmData } from '../../api/analysis'

const chartRef = ref(null)

onMounted(async () => {
  const chart = echarts.init(chartRef.value)
  
  let mockData = []
  try {
    const res = await getRfmData()
    if (res.code === 200) {
      mockData = res.data
    }
  } catch (error) {
    console.error('Failed to load RFM data:', error)
  }
  
  const option = {
    title: {
      text: 'X轴：最近一次消费间隔(R)  Y轴：消费频率(F)  气泡大小：累计消费额(M)',
      subtext: '基于模拟数据',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      formatter: function (param) {
        const value = param.value
        return `
          <div style="padding: 5px;">
            <div style="font-weight: bold; margin-bottom: 5px;">${value[3]} (${value[4]})</div>
            <div>最近消费(R): ${value[0]} 天前</div>
            <div>消费频次(F): ${value[1]} 次</div>
            <div>累计消费(M): ￥${value[2]}</div>
          </div>
        `
      }
    },
    xAxis: {
      type: 'value',
      name: 'R (Days)',
      nameLocation: 'middle',
      nameGap: 30,
      scale: true
    },
    yAxis: {
      type: 'value',
      name: 'F (Times)',
      nameLocation: 'middle',
      nameGap: 40,
      scale: true
    },
    series: [
      {
        name: 'RFM',
        type: 'scatter',
        data: mockData,
        symbolSize: function (data) {
          return Math.sqrt(data[2]) * 1.5; // 根据金额调整气泡大小
        },
        itemStyle: {
          color: function(param) {
             const type = param.value[4]
             if (type.includes('价值')) return '#409EFF'
             if (type.includes('保持')) return '#E6A23C'
             if (type.includes('发展')) return '#67C23A'
             if (type.includes('挽留')) return '#F56C6C'
             return '#909399'
          },
          opacity: 0.8,
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      }
    ]
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
})
</script>

<style scoped>
.analysis-container {
  padding: 10px;
}
.data-card {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}
.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}
.card-unit {
  font-size: 14px;
  font-weight: normal;
  color: #909399;
}
.card-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
