<p align="right">
  <a href="./README.md">简体中文</a> | <a href="./README.en.md">English</a>
</p>

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

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=InvolutionHell/involutionhell.github.io&type=Date)](https://star-history.com/#InvolutionHell/involutionhell.github.io&Date)

---

## 📜 协议与版权

本项目代码遵循 [MIT License](LICENSE) 开源。

### 版权声明总纲

- **MIT 协议仅适用于代码部分**。
- 本仓库中分享的文章、文档等内容版权归原作者所有。
- 我们无法认证分享者是否为该文章的创作者。
- 若您的版权受到侵害，请随时联系我们，我们将及时处理。

### 关于项目代码

本项目的**代码**部分（指用于构建和运行本网站的程序代码）遵循 MIT 开源协议。

这意味着您可以自由地使用、复制、修改、合并、出版、分发、再授权及销售这些代码的副本，但必须在所有副本或主要部分中包含原始的版权声明和许可声明。

详情请见 [LICENSE](LICENSE) 文件。

### 关于分享内容

本平台所展示/收录的**文章、评论及其他形式的内容**，其版权归原作者所有。

**请注意**：

1.  内容的版权**不**遵循 MIT 协议，仍由原作者保留。
2.  除特殊声明或获得原作者授权外，**任何人不得**将这些内容用于商业目的进行转载、修改等二次创作。
3.  本项目作为分享平台，无法对所有内容的原创性、合法性进行一一核实。

### 版权侵权处理

我们尊重并致力于保护知识产权。如果您认为平台上的任何内容侵犯了您的合法权益，请立即通过 **[提交 Issue](https://github.com/InvolutionHell/involutionhell.github.io/issues/new)** 与我们联系。我们承诺在收到通知并核实情况后，会迅速采取删除、屏蔽等必要措施。
