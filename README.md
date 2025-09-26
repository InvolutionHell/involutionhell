<p align="right">
  <a href="./README.md">简体中文</a> | <a href="./README.en.md">English</a>
</p>

# 内卷地狱知识库

## 📋 关于

[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/InvolutionHell/involutionhell.github.io)

这是一个基于现代 Web 技术的协作文档平台，帮助学生分享和获取学习资料、课程笔记和项目经验。

**平台亮点**

- Next.js App Router + Fumadocs UI 打造的高性能站点
- 支持多语言与“文件即导航”的目录结构
- 自动化部署、图片迁移和内容校验，降低维护成本

## 🚀 快速开始

**环境要求**

- Node.js 18+
- 推荐使用 pnpm（也兼容 npm / yarn）

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
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

> Windows + VSCode(Cursor) 可能触发 Husky 提交钩子问题，建议直接使用命令行执行 `git commit`。

更多安装脚本、调试命令与常见问题，请查看 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 📁 目录概览

```
📦 involutionhell.github.io
├── 📂 app/              # Next.js App Router
│   ├── 📂 components/   # UI 组件
│   ├── 📂 docs/         # 文档内容（Folder as a Book）
│   └── 📄 layout.tsx    # 根布局
├── 📄 source.config.ts  # Fumadocs 配置
├── 📄 tailwind.config.ts
└── 📄 package.json
```

站内文档采用分层式“Folder as a Book”结构。命名规范、Frontmatter 要求等写作细则详见贡献指南。

## 🤝 一起贡献

我们欢迎来自社区的任何形式的改进与补充：

- 内容与翻译
- Bug 修复与脚本优化
- UI / UX 设计与实现
- 文档与流程完善

完整流程、PR 检查与 UI 协作约定请参考 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 🖼️ 文档与资产

仓库提供自动化图片迁移与 Lint 规则。如何放置图片、引用资产、撰写 Frontmatter 等细节已在贡献指南中整理：

- [文档规范与图片管理](CONTRIBUTING.md#-文档规范)
- [可用脚本与自动化工具](CONTRIBUTING.md#-可用脚本)

## 🙏 特别鸣谢

感谢上海 AI Lab 书生大模型对本项目的算力支持！

![](./public/shanghaiailab.png)

- [InternS1 项目地址](https://github.com/InternLM/Intern-S1/tree/main)
- [InternStudio 算力平台](https://studio.intern-ai.org.cn/console/dashboard)
- [书生浦语 API 文档](https://internlm.intern-ai.org.cn/api/document)

## ⭐️ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=InvolutionHell/involutionhell.github.io&type=Date)](https://star-history.com/#InvolutionHell/involutionhell.github.io&Date)

## 📜 协议与版权

本项目代码遵循 [MIT License](LICENSE) 开源。

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
