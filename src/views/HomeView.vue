<template>
  <div>
    <div class="hero-panel">
      <div class="hero-card hero-copy">
        <h2>欢迎来到智能成绩分析系统</h2>
        <p>
          一站式成绩管理与可视化分析，支持成绩查看、导入导出、数据统计和排名展示，帮助你更快了解班级学习表现。
        </p>
        <div class="hero-actions">
          <RouterLink to="/scores" class="button-primary">管理成绩</RouterLink>
          <RouterLink to="/analysis" class="button-secondary">查看分析</RouterLink>
        </div>
      </div>

      <div class="hero-card">
        <div class="page-overview">
          <div class="overview-item">
            <div class="overview-label">当前学生</div>
            <div class="overview-value">{{ studentCount }}</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">成绩条数</div>
            <div class="overview-value">{{ scores.length }}</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">平均分</div>
            <div class="overview-value">{{ averageScore }}</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">及格率</div>
            <div class="overview-value">{{ passRate }}%</div>
          </div>
        </div>
      </div>
    </div>

    <section class="card-grid">
      <StatCard title="学生人数" :value="studentCount" subText="当前参与统计人数" />
      <StatCard title="成绩条数" :value="scores.length" subText="已录入的成绩记录" />
      <StatCard title="平均分" :value="averageScore" subText="所有成绩的平均值" />
      <StatCard title="及格率" :value="passRate + '%'" subText="分数 ≥ 60 为及格" />
    </section>

    <section class="panel-grid">
      <QuickPanel title="最近成绩记录">
        <table class="table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>科目</th>
              <th>分数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in scores.slice(0, 6)" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.subject }}</td>
              <td>{{ item.score }}</td>
            </tr>
          </tbody>
        </table>
      </QuickPanel>

      <QuickPanel title="当前科目标签">
        <div class="tag-list">
          <span v-for="subject in subjects" :key="subject" class="tag">{{ subject }}</span>
        </div>
      </QuickPanel>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import StatCard from '../components/StatCard.vue'
import QuickPanel from '../components/QuickPanel.vue'
import api from '../api'
import { mockScores } from '../data/mockScores.js'

const scores = ref([])

const loadScores = async () => {
  try {
    const res = await api.get('/scores')
    const remoteScores = res.scores || []
    scores.value = remoteScores.length ? remoteScores : mockScores
  } catch (error) {
    console.error('加载成绩失败', error)
    scores.value = mockScores
  }
}

onMounted(() => {
  loadScores()
})

const studentCount = computed(() => {
  const names = new Set(scores.value.map(item => item.name))
  return names.size
})

const averageScore = computed(() => {
  if (!scores.value.length) return 0
  const total = scores.value.reduce((sum, item) => sum + item.score, 0)
  return (total / scores.value.length).toFixed(1)
})

const passRate = computed(() => {
  if (!scores.value.length) return 0
  const passCount = scores.value.filter(item => item.score >= 60).length
  return ((passCount / scores.value.length) * 100).toFixed(1)
})

const subjects = computed(() => {
  return [...new Set(scores.value.map(item => item.subject))]
})
</script>

<style scoped>
.quick-box {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.quick-btn {
  display: inline-block;
  background: #3b82f6;
  color: white;
  text-align: center;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: bold;
}

.quick-btn-light {
  background: #e2e8f0;
  color: #0f172a;
}

.subject-box {
  margin-top: 10px;
}

.subject-title {
  font-weight: bold;
  margin-bottom: 10px;
}
</style>