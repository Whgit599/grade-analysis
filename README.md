# 成绩分析系统

> 一个基于 Vue 3 + Node.js + SQLite 的学生成绩管理与统计分析系统。

## ✨ 项目简介

本项目支持学生成绩录入、编辑、删除、按姓名查询、Excel 导入导出、科目统计和学生总分排名，适合课程设计、学习演示或小型本地成绩管理场景。

## 🛠️ 技术栈

- 前端：Vue 3 / Vite / Vue Router
- 后端：Node.js / Express
- 数据库：SQLite / better-sqlite3
- 文件处理：xlsx

## 📁 项目结构

```text
grade-analysis/
├── public/              # 静态资源
├── server/              # 后端服务与 SQLite 数据库
│   ├── database.sqlite
│   └── index.js
├── src/                 # 前端源码
│   ├── api/             # 请求封装
│   ├── assets/          # 全局样式
│   ├── components/      # 公共组件
│   ├── router/          # 前端路由
│   └── views/           # 页面
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 快速启动

### 1. 安装依赖

```bash
npm install
```

### 2. 启动后端服务

```bash
npm run server
```

后端默认运行在：`http://localhost:3000`

### 3. 启动前端开发服务

请打开第二个终端执行：

```bash
npm run dev
```

然后根据终端提示访问前端页面，通常是：`http://localhost:5173`

## 🔐 默认登录账号

```text
用户名：admin
密码：123456
```

> 当前登录功能为本地演示版，正式使用时建议改为用户表、密码加密和 Token 鉴权。

## 📊 功能特性

- ✅ 登录与路由访问控制
- ✅ 学生成绩新增、编辑、删除、查询
- ✅ Excel 导入与导出
- ✅ 清空成绩数据
- ✅ 学生总分排名
- ✅ 科目平均分、最高分、最低分统计
- ✅ SQLite 本地持久化存储

## 📥 Excel 导入格式

支持表头为中文或英文：

| 姓名/name | 科目/subject | 分数/score |
| --- | --- | --- |
| 张三 | 数学 | 120 |

## 🧪 构建检查

```bash
npm run build
```

## 后续优化方向

- 增加更完整的权限系统和操作日志；
- 支持班级、学号、考试名称等字段；
- 增加 ECharts 可视化图表；
- 将后端路由拆分为模块，提高可维护性。
