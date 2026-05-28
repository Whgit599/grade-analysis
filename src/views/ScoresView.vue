<template>
  <div class="panel page-panel">
    <div class="page-header">
      <h2>成绩管理</h2>
      <div class="search-box">
        <input v-model.trim="searchName" placeholder="输入姓名查找" @keyup.enter="getScores" />
        <button @click="getScores">查找</button>
        <button v-if="searchName" @click="resetSearch">重置</button>
      </div>
      <div class="action-buttons">
        <button @click="exportExcel">导出Excel</button>
        <label class="import-label">导入Excel<input type="file" accept=".xlsx,.xls" @change="importExcel" hidden /></label>
        <button class="danger-btn" @click="clearAllScores">清空成绩</button>
      </div>
    </div>

    <div class="add-form">
      <input v-model.trim="form.name" placeholder="姓名" />
      <input v-model.trim="form.subject" placeholder="科目" />
      <input v-model.number="form.score" type="number" min="0" max="150" placeholder="分数" />
      <button @click="saveScore">{{ editingId ? '保存' : '添加' }}</button>
      <button v-if="editingId" @click="cancelEdit">取消</button>
    </div>

    <p v-if="message" class="message">{{ message }}</p>

    <table class="table" v-if="scores.length">
      <thead>
        <tr><th>编号</th><th>姓名</th><th>科目</th><th>分数</th><th>操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="(item,index) in scores" :key="item.id">
          <td>{{ index + 1 }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.subject }}</td>
          <td>{{ item.score }}</td>
          <td>
            <button @click="edit(item)">编辑</button>
            <button class="danger-btn" @click="del(item.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty-tip">暂无成绩数据</p>

    <div class="rank-box" v-if="rankList.length">
      <h3>学生总分排名</h3>
      <table class="table">
        <thead><tr><th>排名</th><th>姓名</th><th>总分</th></tr></thead>
        <tbody>
          <tr v-for="item in rankList" :key="item.name"><td>{{ item.rank }}</td><td>{{ item.name }}</td><td>{{ item.total }}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import api from '../api'

const scores = ref([])
const searchName = ref('')
const editingId = ref(null)
const message = ref('')
const form = reactive({ name: '', subject: '', score: '' })

const rankList = computed(() => {
  const map = {}
  scores.value.forEach(s => {
    map[s.name] = (map[s.name] || 0) + Number(s.score)
  })
  const list = Object.entries(map).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total)
  let rank = 1
  let prev = null
  return list.map((item, i) => {
    if (i > 0 && item.total !== prev) rank = i + 1
    prev = item.total
    return { ...item, rank }
  })
})

const setMessage = (text) => {
  message.value = text
  if (text) setTimeout(() => { message.value = '' }, 2500)
}

const validateForm = () => {
  if (!form.name || !form.subject || form.score === '') return '请完整填写姓名、科目和分数'
  const score = Number(form.score)
  if (!Number.isFinite(score) || score < 0 || score > 150) return '分数范围应为 0-150'
  return ''
}

const getScores = async () => {
  try {
    const query = searchName.value ? `?name=${encodeURIComponent(searchName.value)}` : ''
    const res = await api.get(`/scores${query}`)
    scores.value = res.scores || []
  } catch (error) {
    setMessage(error.message || '加载成绩失败')
  }
}

const resetForm = () => {
  form.name = ''
  form.subject = ''
  form.score = ''
  editingId.value = null
}

const saveScore = async () => {
  const error = validateForm()
  if (error) return setMessage(error)

  try {
    const payload = { name: form.name, subject: form.subject, score: Number(form.score) }
    if (editingId.value) {
      await api.put(`/scores/${editingId.value}`, payload)
      setMessage('修改成功')
    } else {
      await api.post('/scores', payload)
      setMessage('添加成功')
    }
    resetForm()
    getScores()
  } catch (error) {
    setMessage(error.message || '保存失败')
  }
}

const edit = (item) => {
  editingId.value = item.id
  form.name = item.name
  form.subject = item.subject
  form.score = item.score
}

const cancelEdit = resetForm

const del = async (id) => {
  if (!confirm('确认删除这条成绩？')) return
  try {
    await api.del(`/scores/${id}`)
    setMessage('删除成功')
    getScores()
  } catch (error) {
    setMessage(error.message || '删除失败')
  }
}

const resetSearch = () => {
  searchName.value = ''
  getScores()
}

const exportExcel = () => window.open('/api/export')

const cleanText = (value) => String(value ?? '').replace(/\s+/g, '').trim()

const parseScoreValue = (value) => {
  if (value === null || value === undefined || value === '') return null
  const score = Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(score) && score >= 0 && score <= 150 ? score : null
}

const normalizeSubjectName = (header) => {
  return cleanText(header)
    .replace(/成绩|得分|分数|分$/g, '')
    .replace(/学科|科目/g, '')
}

const isSubjectScoreHeader = (header) => {
  const text = cleanText(header)
  if (!text) return false
  if (/总分|排名|名次|校名|班名|班级|考号|姓名|平均|最高|最低/.test(text)) return false
  return /分数|成绩|得分$|语文|数学|理数|英语|物理|化学|生物|政治|历史|地理|道法|科学|体育|美术|音乐|信息/.test(text)
}

const parseExcelScores = (sheet) => {
  const table = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  const result = []
  const seen = new Set()

  for (let headerIndex = 0; headerIndex < Math.min(table.length, 20); headerIndex += 1) {
    const headers = table[headerIndex].map(cleanText)
    const nameIndex = headers.findIndex(header => /^(姓名|学生姓名|名字)$/.test(header))
    if (nameIndex === -1) continue

    const subjectIndex = headers.findIndex(header => /^(科目|学科|subject)$/i.test(header))
    const scoreIndex = headers.findIndex(header => /^(分数|成绩|得分|score)$/i.test(header))

    // 兼容“姓名 / 科目 / 分数”三列表格
    if (subjectIndex !== -1 && scoreIndex !== -1) {
      table.slice(headerIndex + 1).forEach(row => {
        const name = cleanText(row[nameIndex])
        const subject = cleanText(row[subjectIndex])
        const score = parseScoreValue(row[scoreIndex])
        if (name && subject && score !== null) {
          const key = `${name}-${subject}`
          if (!seen.has(key)) {
            result.push({ name, subject, score })
            seen.add(key)
          }
        }
      })
      if (result.length) return result
    }

    // 兼容截图中的宽表：姓名 + 语文分数/理数分数/英语分数/物理分数...
    const scoreColumns = headers
      .map((header, index) => ({ header, index, subject: normalizeSubjectName(header) }))
      .filter(col => col.index !== nameIndex && col.subject && isSubjectScoreHeader(col.header))

    if (!scoreColumns.length) continue

    table.slice(headerIndex + 1).forEach(row => {
      const name = cleanText(row[nameIndex])
      if (!name) return

      scoreColumns.forEach(({ index, subject }) => {
        const score = parseScoreValue(row[index])
        if (score === null) return

        const key = `${name}-${subject}`
        if (!seen.has(key)) {
          result.push({ name, subject, score })
          seen.add(key)
        }
      })
    })

    if (result.length) return result
  }

  return result
}

const importExcel = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const allScores = workbook.SheetNames.flatMap(sheetName => parseExcelScores(workbook.Sheets[sheetName]))
    const normalizedRows = Array.from(
      new Map(allScores.map(item => [`${item.name}-${item.subject}`, item])).values()
    )

    if (!normalizedRows.length) {
      setMessage('未识别到有效成绩，请确认表格包含“姓名”和各科“分数”列')
      return
    }

    const res = await api.post('/scores/batch', { scores: normalizedRows })
    setMessage(`导入完成，识别 ${normalizedRows.length} 条，有效录入 ${res.count || 0} 条`)
    getScores()
  } catch (error) {
    setMessage(error.message || '导入失败，请检查 Excel 格式')
  } finally {
    e.target.value = ''
  }
}

const clearAllScores = async () => {
  if (!confirm('确认清空全部成绩？此操作不可恢复。')) return
  try {
    await api.post('/clear-all-scores')
    resetForm()
    getScores()
    setMessage('已清空全部成绩')
  } catch (error) {
    setMessage(error.message || '清空失败')
  }
}

onMounted(getScores)
</script>

<style scoped>
.page-header,
.search-box,
.action-buttons,
.add-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.add-form {
  margin: 20px 0;
}

input {
  padding: 10px 12px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
}

button,
.import-label {
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
}

.danger-btn {
  background: #ef4444;
}

.message {
  margin: 10px 0;
  color: #2563eb;
}

.rank-box {
  margin-top: 30px;
}
</style>
