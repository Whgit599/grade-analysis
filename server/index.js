import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import * as XLSX from 'xlsx'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const db = new Database(path.join(__dirname, 'database.sqlite'))

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    score INTEGER NOT NULL
  );

  DELETE FROM scores
  WHERE id NOT IN (
    SELECT MAX(id)
    FROM scores
    GROUP BY name, subject
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_scores_name_subject
  ON scores(name, subject);
`)

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

const normalizeScore = ({ name, subject, score }) => ({
    name: String(name || '').trim(),
    subject: String(subject || '').trim(),
    score: Number(score)
})

const validateScore = (data) => {
    if (!data.name || !data.subject || !Number.isFinite(data.score)) return '姓名、科目和分数不能为空'
    if (data.score < 0 || data.score > 150) return '分数范围应为 0-150'
    return ''
}

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body
    if (username === 'admin' && password === '123456') {
        return res.json({ user: { username: 'admin', role: 'manager' } })
    }
    res.status(401).json({ message: '用户名或密码错误' })
})

app.get('/api/scores', (req, res) => {
    const name = String(req.query.name || '').trim()
    const scores = name
        ? db.prepare('SELECT * FROM scores WHERE name LIKE ? ORDER BY id DESC').all(`%${name}%`)
        : db.prepare('SELECT * FROM scores ORDER BY id DESC').all()
    res.json({ scores })
})

app.post('/api/scores', (req, res) => {
    const data = normalizeScore(req.body)
    const message = validateScore(data)
    if (message) return res.status(400).json({ message })

    const result = db
        .prepare('INSERT INTO scores (name, subject, score) VALUES (?, ?, ?) ON CONFLICT(name, subject) DO UPDATE SET score=excluded.score')
        .run(data.name, data.subject, data.score)
    res.json({ success: true, id: result.lastInsertRowid })
})

app.post('/api/scores/batch', (req, res) => {
    const rows = Array.isArray(req.body?.scores) ? req.body.scores : []
    const stmt = db.prepare('INSERT INTO scores (name, subject, score) VALUES (?, ?, ?) ON CONFLICT(name, subject) DO UPDATE SET score=excluded.score')
    const saveMany = db.transaction((items) => {
        let count = 0
        for (const item of items) {
            const data = normalizeScore(item)
            if (!validateScore(data)) {
                stmt.run(data.name, data.subject, data.score)
                count += 1
            }
        }
        return count
    })
    res.json({ success: true, count: saveMany(rows) })
})

app.put('/api/scores/:id', (req, res) => {
    const data = normalizeScore(req.body)
    const message = validateScore(data)
    if (message) return res.status(400).json({ message })

    db.prepare('UPDATE scores SET name=?, subject=?, score=? WHERE id=?').run(data.name, data.subject, data.score, req.params.id)
    res.json({ success: true })
})

app.delete('/api/scores/:id', (req, res) => {
    db.prepare('DELETE FROM scores WHERE id=?').run(req.params.id)
    res.json({ success: true })
})

app.post('/api/clear-all-scores', (req, res) => {
    db.prepare('DELETE FROM scores').run()
    res.json({ success: true })
})

app.get('/api/export', (req, res) => {
    const rows = db.prepare('SELECT * FROM scores ORDER BY id DESC').all()
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), '成绩')
    res.setHeader('Content-Disposition', 'attachment; filename=scores.xlsx')
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.send(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
})

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ message: '服务器内部错误' })
})

app.listen(3000, () => console.log('✅ 后端启动：http://localhost:3000'))
