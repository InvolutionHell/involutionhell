<p align="right">
  <a href="./README.md">简体中文</a> | <a href="./README.en.md">English</a>
</p>

# Involution Hell Knowledge Base

## 📋 About

[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/InvolutionHell/involutionhell.github.io)

A collaborative documentation platform built with modern web technologies to help students share study notes, course materials, and project experience.

**Highlights**

- High-performance site powered by Next.js App Router and Fumadocs UI
- Multi-language support with a "folder as navigation" content model
- Automated deployment, image migration, and linting to reduce maintenance overhead

## 🚀 Quick Start

**Prerequisites**

- Node.js 18+
- pnpm recommended (npm / yarn also work)

**Local preview**

```bash
git clone https://github.com/involutionhell/involutionhell.github.io.git
cd involutionhell.github.io
pnpm install
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

> On Windows with VSCode(Cursor) you may hit a Husky hook issue. Run `git commit` from a terminal instead.

Looking for additional scripts, debugging tips, or contribution workflows? Check out [CONTRIBUTING.md](CONTRIBUTING.md).

## 📁 Directory Overview

```
📦 involutionhell.github.io
├── 📂 app/              # Next.js App Router
│   ├── 📂 components/   # UI components
│   ├── 📂 docs/         # Content (folder-as-a-book)
│   └── 📄 layout.tsx    # Root layout
├── 📄 source.config.ts  # Fumadocs configuration
├── 📄 tailwind.config.ts
└── 📄 package.json
```

Documentation follows a layered "Folder as a Book" structure. Naming rules, required frontmatter, and authoring tips live in the contribution guide.

## 🤝 Contribute Together

Community contributions are always welcome:

- Content & translations
- Bug fixes and tooling improvements
- UI / UX design and implementation
- Documentation and workflow enhancements

For the full workflow, PR checklist, and UI collaboration guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## 🖼️ Documentation & Assets

The repo ships with automated image migration and linting. Learn how to place assets, reference images, and structure frontmatter in:

- [Documentation guidelines & asset rules](CONTRIBUTING.md#-文档规范)
- [Available scripts & automation](CONTRIBUTING.md#-可用脚本)

## 🙏 Special Thanks

Thanks to Shanghai AI Lab for providing computing support!

![](./public/shanghaiailab.png)

- [InternS1 Project](https://github.com/InternLM/Intern-S1/tree/main)
- [InternStudio Platform](https://studio.intern-ai.org.cn/console/dashboard)
- [Puyu API Docs](https://internlm.intern-ai.org.cn/api/document)

## ⭐️ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=InvolutionHell/involutionhell.github.io&type=Date)](https://star-history.com/#InvolutionHell/involutionhell.github.io&Date)

## 📜 License & Copyright

The project code is released under the [MIT License](LICENSE).

### Codebase

The **code** (i.e., the software powering this site) is licensed under MIT: you may use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software as long as the original copyright notice and permission notice are included. See [LICENSE](LICENSE) for details.

### Shared Content

The copyright of **articles, comments, and other contributed content** remains with the original authors:

1. The content is **not** covered by the MIT License; commercial reuse or derivative works require permission.
2. We cannot individually verify every submission for originality or legality.

If your rights are infringed, please **[open an issue](https://github.com/InvolutionHell/involutionhell.github.io/issues/new)**. We will review and take appropriate action (removal, blocking, etc.) promptly.
