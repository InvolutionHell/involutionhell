# LLM Playbook

This guide distills the key information an autonomous agent or ChatGPT-style assistant needs when working in this repository.

## Project summary

- **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Fumadocs UI.
- **Purpose:** Collaborative knowledge base for students, served from `app/docs/` content.
- **Configs of interest:**
  - `source.config.ts` – Fumadocs sources and structure.
  - `mdx-components.tsx` – custom MDX components available to docs.
  - `components/` – reusable UI building blocks.

## Common tasks

### Updating content

1. Edit or add Markdown/MDX files under `app/docs/`.
2. Preserve the frontmatter block with at least `title` and include optional metadata (`description`, `date`, `tags`).
3. Place referenced media inside `<doc>.assets/` and run `pnpm lint:images` if assets change.

### Implementing UI logic

1. Add shared pieces to `components/` or page-specific pieces under the relevant `app/` route folder.
2. Use Tailwind utilities for styling; follow existing responsive patterns.
3. Ensure server/client boundaries are respected (declare `"use client"` only when necessary).

## Useful commands

- `pnpm install` – install dependencies (Node.js 18+ required).
- `pnpm dev` – start the development server at <http://localhost:3000>.
- `pnpm build` – run the production build (use when changing runtime code or config).
- `pnpm lint:images` – validate documentation images.

## Review checklist

- [ ] Frontmatter present on new/edited docs.
- [ ] Assets live beside their documents.
- [ ] Components match surrounding code style and naming.
- [ ] Necessary scripts/tests executed and mentioned in the report.
- [ ] PR summary explains user-visible changes and follow-up steps if any.

For deeper details, read `README.md`, `README.en.md`, and `CONTRIBUTING.md`.
