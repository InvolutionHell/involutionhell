# 内卷地狱知识库

## 📋 关于

[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/InvolutionHell/involutionhell.github.io)

这是一个基于现代 Web 技术的协作文档平台，旨在帮助学生们分享和访问学习资料。

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm（推荐）

### ❗️如果您是`Windows` + `VSCode(Cursor)`, 您可能会触发`Husky`的BUG, 请使用命令行(`git commit`)的方式来进行代码提交❗️

### 安装

```bash
# 克隆仓库
git clone https://github.com/involutionhell/involutionhell.github.io.git
cd involutionhell.github.io

如果你的电脑还没有安装 pnpm，可以先运行：

# 全局安装 pnpm
npm install -g pnpm

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 查看站点。

## 📁 项目结构

```
📦 involutionhell.github.io
├── 📂 app/                          # Next.js App Router
│   ├── 📂 components/               # React 组件
│   ├── 📂 docs/                     # 文档内容
│   │   └── 📂 ai/     # ai知识库
│   ├── 📄 layout.tsx               # 根布局
│   └── 📄 page.tsx                 # 主页
├── 📂 source.config.ts              # Fumadocs 配置
├── 📂 tailwind.config.ts           # Tailwind CSS 配置
└── 📄 package.json                 # 依赖和脚本
```

## 🤝 贡献

我们欢迎社区贡献！在开始之前，请阅读我们的[贡献指南](CONTRIBUTING.md)。

### 贡献方式

- 📝 **内容**：添加新文章或改进现有文章
- 🐛 **错误修复**：报告并修复问题
- 🎨 **UI/UX**：改进设计和用户体验
- 🌐 **翻译**：帮助多语言支持
- 📖 **文档**：改进项目文档

### 贡献者快速开始

1. Fork 本仓库
2. 创建特性分支: `git checkout -b feat/your-feature`
3. 进行修改
4. 测试修改: `pnpm check:content`
5. 提交 PR

## 📚 文档结构

我们的内容采用分层式的"Folder as a Book"结构：

```
📂 docs/
├── 📂 computer-science/           # 计算机科学
│   ├── 📄 index.mdx               # 计算机科学概述
│   └── 📂 data-structures/        # 数据结构
│       ├── 📄 index.mdx           # 数据结构概述
│       ├── 📂 array/              # 数组
│       │   ├── 📄 index.mdx       # 数组概述
│       │   ├── 📄 01-static-array.mdx
│       │   └── 📄 02-dynamic-array.mdx
│       └── 📂 linked-list/        # 链表
│           ├── 📄 index.mdx       # 链表概述
│           └── 📄 01-singly-linked-list.mdx
```

## 🛠️ 可用脚本

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器
pnpm postinstall
pnpm lint:images      # 检查图片符合规则
pnpm migrate:images   # 迁移图片
```

## 图片管理规范（简要）

自动化脚本会移动您引用的图片到 MDX 同目录下, 遵循以下规则:

- 存放：与 MDX 同目录的 `./<basename>.assets/` 中。
  - 例：`foo.mdx` → `./foo.assets/<img>.png`；`index.mdx` → `./index.assets/<img>.png`。
- 引用：相对路径 `![](./<basename>.assets/<img>.png)`。
- 自动化：提交时自动迁移并改引用；图片 Lint 只提示不拦截提交。
- 共享：站点级用 `/images/site/*`、组件演示用 `/images/components/<name>/*`；多文档共用的图片可保留 `/images/...`。

## 特别鸣谢

### 感谢上海 AI Lab 书生大模型对本项目的算力支持！

![](./public/shanghaiailab.png)

- [InternS1 项目地址](https://github.com/InternLM/Intern-S1/tree/main)
- [InternStudio 算力平台](https://studio.intern-ai.org.cn/console/dashboard)
- [书生浦语 API 文档](https://internlm.intern-ai.org.cn/api/document)
