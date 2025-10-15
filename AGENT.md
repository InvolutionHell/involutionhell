# AGENT Guidelines

Welcome! This repository hosts the Involution Hell documentation site, built with Next.js App Router, Fumadocs UI, TypeScript, and Tailwind CSS. Follow the instructions below whenever you contribute changes.

## General workflow

- Prefer `pnpm` for all Node.js commands (`pnpm install`, `pnpm dev`, `pnpm build`, etc.).
- Keep changes focused and provide helpful descriptions in commits and PR messages.
- When adding dependencies, ensure they are compatible with Node.js 18+.

## Coding standards

- Follow existing patterns in the codebase; align new components with the established structure under `app/` and `components/`.
- Use TypeScript (`.ts` / `.tsx`) and Tailwind CSS utility classes for styling unless a file already uses a different approach.
- Avoid unnecessary abstractions; keep components small, composable, and accessible.
- Do not wrap imports in `try/catch` blocks.

## Documentation & content

- All documentation lives under `app/docs/` (folder-as-book). Each Markdown/MDX file **must** retain a frontmatter block with at least a `title`.
- Place images referenced by a document inside the document’s sibling `*.assets/` folder. Use the provided image migration scripts if needed.
- Prefer relative links within the docs unless cross-referencing an external resource.

## Testing & validation

- Run relevant scripts before submitting changes. Common checks include:
  - `pnpm dev` for local verification.
  - `pnpm build` for production validation when you touch runtime logic.
  - `pnpm lint:images` when you add or move media assets.

## PR expectations

- Summarize user-facing changes clearly.
- Mention any new scripts, configuration, or docs that reviewers should be aware of.

For additional details, consult `README.md` and `CONTRIBUTING.md`.
