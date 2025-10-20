# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Installation and Setup

```bash
# Install dependencies using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### Development

```bash
# Start development server on http://localhost:3000
pnpm dev

# Build the project
pnpm build

# Start production server
pnpm start

# Process MDX files (runs automatically after install)
pnpm postinstall
```

### Code Quality

```bash
# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Check image compliance with project rules
pnpm lint:images

# Migrate images to proper directory structure
pnpm migrate:images
```

### Git Commits

- The project uses Husky for git hooks and lint-staged for pre-commit formatting
- Prettier will automatically format files on commit
- On Windows + VSCode/Cursor, use command line (`git commit`) instead of GUI to avoid Husky bugs

## Project Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Documentation**: Fumadocs MDX (文档系统)
- **Styling**: Tailwind CSS v4
- **UI Components**: Fumadocs UI + custom components
- **Authentication**: NextAuth (beta)
- **AI Integration**: Vercel AI SDK with Assistant UI
- **Database**: Prisma with Neon (PostgreSQL)

### Directory Structure

```
app/
├── api/           # API routes (auth, chat, docs-tree)
├── components/    # React components
│   ├── assistant-ui/  # AI assistant components
│   └── ui/           # Reusable UI components
├── docs/          # MDX documentation content
│   ├── ai/        # AI-related documentation
│   ├── computer-science/  # CS topics
│   ├── frontend/  # Frontend development
│   └── [...slug]/ # Dynamic routing for docs
├── hooks/         # Custom React hooks
└── layout.tsx     # Root layout with providers
```

### Documentation Structure

- Uses "Folder as a Book" pattern - each folder can have an `index.mdx` for overview
- URLs are auto-generated from file structure (e.g., `docs/ai/llm-basics/index.mdx` → `/ai/llm-basics`)
- File naming: use `kebab-case` and numeric prefixes for ordering (e.g., `01-intro.mdx`)
- Numeric prefixes are stripped from final URLs

### Image Management

- Images should be placed in `./<basename>.assets/` directory alongside the MDX file
- Example: `foo.mdx` → images go in `./foo.assets/`
- Auto-migration scripts handle image placement during commits
- Site-wide images: `/images/site/*`
- Component demos: `/images/components/<name>/*`

### MDX Frontmatter

Required fields:

```yaml
---
title: Document Title
---
```

Optional fields:

```yaml
---
description: Brief description
date: "2025-01-01"
tags:
  - tag1
  - tag2
---
```

### Key Features

1. **AI Assistant**: Integrated chat interface with support for multiple AI providers
2. **Internationalization**: Using next-intl for multi-language support
3. **Search**: Orama search integration for documentation
4. **Comments**: Giscus integration for discussion
5. **Math Support**: KaTeX for mathematical expressions
6. **Authentication**: GitHub OAuth integration

### Development Considerations

- The project uses Fumadocs for documentation, refer to [Fumadocs docs](https://fumadocs.dev/docs) for UI components
- Math expressions use remark-math and rehype-katex plugins
- Authentication is handled via NextAuth with Neon database adapter
- The project includes pre-configured GitHub Actions for automated deployment
