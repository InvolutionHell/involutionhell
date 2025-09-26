<p align="right">
  <a href="./README.md">简体中文</a> | <a href="./README.en.md">English</a>
</p>

# Involution Hell Knowledge Base

## 📋 About

[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/InvolutionHell/involutionhell.github.io)

This is a collaborative documentation platform based on modern web technologies, designed to help students share and access learning materials.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### ❗️If you are using `Windows` + `VSCode(Cursor)`, you may encounter a `Husky` bug. Please use the command line (`git commit`) to commit your code.❗️

### Installation

```bash
# Clone the repository
git clone https://github.com/involutionhell/involutionhell.github.io.git
cd involutionhell.github.io

If you don't have pnpm installed yet, you can run:

# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open your browser and visit [http://localhost:3000](http://localhost:3000) to see the site.

## 📁 Project Structure

```
📦 involutionhell.github.io
├── 📂 app/                          # Next.js App Router
│   ├── 📂 components/               # React components
│   ├── 📂 docs/                     # Document content
│   │   └── 📂 ai/                   # AI knowledge base
│   ├── 📄 layout.tsx               # Root layout
│   └── 📄 page.tsx                 # Home page
├── 📂 source.config.ts              # Fumadocs configuration
├── 📂 tailwind.config.ts           # Tailwind CSS configuration
└── 📄 package.json                 # Dependencies and scripts
```

## 🤝 Contributing

We welcome community contributions! Before you start, please read our [Contribution Guide](CONTRIBUTING.md).

### How to Contribute

- 📝 **Content**: Add new articles or improve existing ones
- 🐛 **Bug Fixes**: Report and fix issues
- 🎨 **UI/UX**: Improve design and user experience
- 🌐 **Translation**: Help with multi-language support
- 📖 **Documentation**: Improve project documentation

### Quick Start for Contributors

1. Fork this repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Test your changes: `pnpm check:content`
5. Submit a PR

## 📚 Documentation Structure

Our content uses a hierarchical "Folder as a Book" structure:

```
📂 docs/
├── 📂 computer-science/           # Computer Science
│   ├── 📄 index.mdx               # Computer Science Overview
│   └── 📂 data-structures/        # Data Structures
│       ├── 📄 index.mdx           # Data Structures Overview
│       ├── 📂 array/              # Array
│       │   ├── 📄 index.mdx       # Array Overview
│       │   ├── 📄 01-static-array.mdx
│       │   └── 📄 02-dynamic-array.mdx
│       └── 📂 linked-list/        # Linked List
│           ├── 📄 index.mdx       # Linked List Overview
│           └── 📄 01-singly-linked-list.mdx
```

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start the development server
pnpm build            # Build for production
pnpm start            # Start the production server
pnpm postinstall
pnpm lint:images      # Check if images follow the rules
pnpm migrate:images   # Migrate images
```

## Image Management Guidelines (Brief)

An automated script will move the images you reference to the same directory as the MDX file, following these rules:

- **Storage**: In `./<basename>.assets/` in the same directory as the MDX file.
  - Example: `foo.mdx` → `./foo.assets/<img>.png`; `index.mdx` → `./index.assets/<img>.png`.
- **Reference**: Relative path `![](./<basename>.assets/<img>.png)`.
- **Automation**: Automatically migrates and changes references on commit; Image Lint only warns and does not block commits.
- **Sharing**: Use `/images/site/*` for site-level images, `/images/components/<name>/*` for component demos; images shared by multiple documents can be kept in `/images/...`.

## Special Thanks

### Thanks to Shanghai AI Lab for providing computing power support for this project!

![](./public/shanghaiailab.png)

- [InternS1 Project Address](https://github.com/InternLM/Intern-S1/tree/main)
- [InternStudio Computing Power Platform](https://studio.intern-ai.org.cn/console/dashboard)
- [Puyu API Documentation](https://internlm.intern-ai.org.cn/api/document)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=InvolutionHell/involutionhell.github.io&type=Date)](https://star-history.com/#InvolutionHell/involutionhell.github.io&Date)

## License and Copyright Notice

### About the Project Code

The **code** part of this project (referring to the program code used to build and run this website) is licensed under the MIT License.

This means you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the code, but you must include the original copyright notice and license statement in all copies or substantial portions of the software.

For details, see the [LICENSE](LICENSE) file.

### About Shared Content

The copyright of **articles, comments, and other forms of content** displayed/collected on this platform belongs to the original authors.

**Please note**:
1. The copyright of the content does **not** follow the MIT license and is still retained by the original author.
2. Unless otherwise stated or authorized by the original author, **no one may** use this content for commercial purposes, such as reprinting, modification, and other secondary creations.
3. As a sharing platform, this project cannot verify the originality and legality of all content one by one.

#### Copyright Infringement Handling

We respect and are committed to protecting intellectual property. If you believe that any content on the platform infringes your legal rights, please contact us immediately by **[submitting an Issue](https://github.com/InvolutionHell/involutionhell.github.io/issues/new)**. We promise to take necessary measures such as deletion and blocking promptly after receiving the notification and verifying the situation.
