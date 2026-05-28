<template>
  <div class="panel analysis-page">
    <div class="analysis-header">
      <div>
        <h1>成绩分析</h1>
        <p>按科目统计平均分、最高分、最低分，并展示学生总分排名与各科及格率。</p>
      </div>
    </div>

    <p v-if="message" class="message">{{ message }}</p>
    <p v-if="!scores.length" class="empty-tip">暂无成绩数据，请先在成绩管理页面录入或导入成绩。</p>

    <div class="section" v-if="subjectStats.length">
      <div class="section-title">
        <h2>科目统计</h2>
        <span>共 {{ subjectStats.length }} 个科目</span>
      </div>
      <div class="stats-grid">
        <div v-for="subject in subjectStats" :key="subject.name" class="stat-card">
          <div class="subject-name">{{ subject.name }}</div>
          <div class="avg-score">{{ subject.avg.toFixed(2) }}</div>
          <div class="avg-label">平均分</div>
          <div class="score-row">
            <span>最高分：<strong>{{ subject.max }}</strong></span>
            <span>最低分：<strong>{{ subject.min }}</strong></span>
          </div>
        </div>
      </div>
    </div>

    <div class="section" v-if="passRateStats.length">
      <div class="section-title">
        <h2>各科及格率分析</h2>
        <span>分数 ≥ 60 计为及格</span>
      </div>
      <div ref="passRateChartRef" class="chart"></div>
    </div>

    <div class="section" v-if="rankList.length">
      <div class="section-title">
        <h2>学生总分排名 Top 10</h2>
        <span>按总分从高到低排名</span>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>排名</th>
              <th>姓名</th>
              <th v-for="subject in subjectNames" :key="subject">{{ subject }}</th>
              <th>总分</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in topRankList" :key="item.name">
              <td>{{ item.rank }}</td>
              <td>{{ item.name }}</td>
              <td v-for="subject in subjectNames" :key="subject">{{ item.subjectScores[subject] ?? '-' }}</td>
              <td><strong>{{ item.total }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="view-all-btn" @click="showFullScores = !showFullScores">
        {{ showFullScores ? '收起完整成绩' : '查看完整成绩' }}
      </button>
    </div>

    <div class="section full-score-section" v-if="showFullScores && rankList.length">
      <div class="section-title">
        <h2>全班完整成绩</h2>
        <span>共 {{ rankList.length }} 名学生</span>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>排名</th>
              <th>姓名</th>
              <th v-for="subject in subjectNames" :key="subject">{{ subject }}</th>
              <th>总分</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in rankList" :key="item.name">
              <td>{{ item.rank }}</td>
              <td>{{ item.name }}</td>
              <td v-for="subject in subjectNames" :key="subject">{{ item.subjectScores[subject] ?? '-' }}</td>
              <td><strong>{{ item.total }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import api from '../api'

const PASS_SCORE = 60

const scores = ref([])
const subjectStats = ref([])
const rankList = ref([])
const passRateStats = ref([])
const subjectNames = ref([])
const message = ref('')
const showFullScores = ref(false)
const passRateChartRef = ref(null)
let passRateChart = null

const topRankList = computed(() => rankList.value.slice(0, 10))

const calc = () => {
  const subjects = {}
  const students = {}

  scores.value.forEach(item => {
    const score = Number(item.score)
    const subject = String(item.subject || '').trim()
    const name = String(item.name || '').trim()
    if (!name || !subject || !Number.isFinite(score)) return

    subjects[subject] = subjects[subject] || { total: 0, count: 0, passCount: 0, max: score, min: score }
    subjects[subject].total += score
    subjects[subject].count += 1
    subjects[subject].passCount += score >= PASS_SCORE ? 1 : 0
    subjects[subject].max = Math.max(subjects[subject].max, score)
    subjects[subject].min = Math.min(subjects[subject].min, score)

    students[name] = students[name] || { name, total: 0, subjectScores: {} }
    students[name].total += score
    students[name].subjectScores[subject] = score
  })

  subjectNames.value = Object.keys(subjects)
  subjectStats.value = Object.entries(subjects).map(([name, value]) => ({
    name,
    avg: value.total / value.count,
    max: value.max,
    min: value.min,
    count: value.count
  }))

  passRateStats.value = Object.entries(subjects).map(([name, value]) => ({
    name,
    passRate: Number(((value.passCount / value.count) * 100).toFixed(1)),
    passCount: value.passCount,
    count: value.count
  }))

  const list = Object.values(students).sort((a, b) => b.total - a.total)

  let currentRank = 1
  let previousTotal = null
  rankList.value = list.map((item, index) => {
    if (index > 0 && item.total !== previousTotal) currentRank = index + 1
    previousTotal = item.total
    return { ...item, rank: currentRank }
  })
}

const renderPassRateChart = async () => {
  await nextTick()
  if (!passRateChartRef.value || !passRateStats.value.length) return

  if (!passRateChart) {
    passRateChart = echarts.init(passRateChartRef.value)
  }

  passRateChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => {
        const item = params[0]
        const raw = passRateStats.value[item.dataIndex]
        return `${raw.name}<br/>及格率：${raw.passRate}%<br/>及格人数：${raw.passCount}/${raw.count}`
      }
    },
    grid: { left: 48, right: 24, top: 28, bottom: 48 },
    xAxis: {
      type: 'category',
      data: passRateStats.value.map(item => item.name),
      axisTick: { alignWithLabel: true }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%' }
    },
    series: [
      {
        name: '及格率',
        type: 'bar',
        barWidth: '45%',
        data: passRateStats.value.map(item => item.passRate),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        },
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#93c5fd' }
          ])
        }
      }
    ]
  })
}

const resizeChart = () => passRateChart?.resize()

watch(passRateStats, renderPassRateChart)

onMounted(async () => {
  try {
    const res = await api.get('/scores')
    scores.value = res.scores || []
    calc()
    window.addEventListener('resize', resizeChart)
  } catch (error) {
    message.value = error.message || '加载分析数据失败'
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  passRateChart?.dispose()
})
</script>

<style scoped>
.analysis-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.analysis-header h1 {
  margin-bottom: 8px;
}

.analysis-header p,
.section-title span {
  color: #64748b;
  line-height: 1.7;
}

.section {
  padding-top: 4px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
}

.stat-card {
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(135deg, #ffffff, #f8fbff);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.subject-name {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;
}

.avg-score {
  font-size: 2.25rem;
  font-weight: 800;
  color: #2563eb;
  line-height: 1;
}

.avg-label {
  color: #64748b;
  margin: 8px 0 16px;
}

.score-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #475569;
}

.chart {
  width: 100%;
  min-height: 360px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 18px;
  background: #fff;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
}

.table-wrapper .table th,
.table-wrapper .table td {
  white-space: nowrap;
}

.view-all-btn {
  margin-top: 16px;
  padding: 10px 18px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}

.full-score-section {
  border-top: 1px dashed rgba(148, 163, 184, 0.5);
  padding-top: 24px;
}

.message {
  margin: 12px 0;
  color: #ef4444;
}

@media (max-width: 600px) {
  .score-row {
    flex-direction: column;
  }
}
</style>
