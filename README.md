# Involution Hell 知识库

## 📋 关于

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

# 安装依赖
pnpm install

# 启动开发服务器
npm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 查看站点。

## 📁 项目结构

```
📦 involutionhell.github.io
├── 📂 app/                          # Next.js App Router
│   ├── 📂 components/               # React 组件
│   ├── 📂 docs/                     # 文档内容
│   │   └── 📂 computer-science/     # 计算机科学知识库
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
