// scripts/generate-community-index.js (FINAL VERSION with Multi-Level Nesting)

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const matter = require('gray-matter');

// --- 配置区 ---
const communityShareDir = path.join(__dirname, '../app/docs/CommunityShare');
const outputFile = path.join(communityShareDir, 'index.mdx');

const categoryDisplayNames = {
  Geek: '技术分享',
  MentalHealth: '心理健康',
  RAG: 'RAG',
};

const headerContent = `---
title: "群友分享"
date: "${new Date().toISOString().split('T')[0]}"
---

欢迎来到群友分享板块！无论你是技术极客，还是热爱生活，都欢迎积极投稿！

一篇微不足道的文章或许可以帮助一个迷茫的陌生人~

> 转载文章请先联系原作者获取授权，谢谢！
`;

// --- 主逻辑 ---
async function generateIndex() {
  try {
    const categories = fs.readdirSync(communityShareDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    let allLinksContent = '';

    for (const category of categories) {
      const categoryPath = path.join(communityShareDir, category);
      const files = await glob(`${categoryPath.replace(/\\/g, '/')}/**/*.{md,mdx}`);

      if (files.length === 0) continue;

      // 自定义排序逻辑
      files.sort((a, b) => {
        const dirA = path.dirname(a);
        const dirB = path.dirname(b);
        if (dirA !== dirB) {
          return dirA.localeCompare(dirB);
        }
        const isAIndex = path.basename(a).startsWith('index.');
        const isBIndex = path.basename(b).startsWith('index.');
        if (isAIndex) return -1;
        if (isBIndex) return 1;
        return path.basename(a).localeCompare(path.basename(b));
      });

      const categoryTitle = categoryDisplayNames[category] || category;
      allLinksContent += `## ${categoryTitle}\n\n`;

      // --- 支持多级嵌套的链接生成逻辑 ---
      const links = files.map(file => {
        const fileContent = fs.readFileSync(file, 'utf8');
        const { data: frontmatter } = matter(fileContent);

        const title = frontmatter.title || path.basename(file, path.extname(file));
        
        const relativePath = path.relative(communityShareDir, file);
        const urlPath = relativePath.replace(/\\/g, '/').replace(/\.(mdx|md)$/, '');
        const finalUrl = urlPath.endsWith('/index') ? urlPath.slice(0, -6) : urlPath;
        const url = `/docs/CommunityShare/${finalUrl}`;
        
        // --- 动态计算缩进深度 ---
        const relativeToCategory = path.relative(categoryPath, file);
        const dirOfFile = path.dirname(relativeToCategory);

        // 1. 计算文件所在目录的深度
        // 如果文件在根目录(.), 深度为0, 否则按路径分隔符数量计算
        const depth = dirOfFile === '.' ? 0 : dirOfFile.split(path.sep).length;
        
        // 2. 判断是否为 index 文件
        const isIndex = path.basename(file).startsWith('index.');
        
        // 3. index 文件使用目录深度, 非 index 文件在目录深度的基础上再缩进一级
        const indentLevel = isIndex ? depth : depth + 1;
        
        const prefix = '  '.repeat(indentLevel) + '- ';

        return `${prefix}[${title}](${url})`;
      });
      // --- 新链接生成逻辑结束 ---
      
      allLinksContent += links.join('\n') + '\n\n';
    }

    const finalContent = `${headerContent}\n${allLinksContent.trim()}`;
    fs.writeFileSync(outputFile, finalContent);

    console.log(`Successfully generated index for CommunityShare at ${outputFile}`);
  } catch (error) {
    console.error('Error generating CommunityShare index file:', error);
    process.exit(1);
  }
}

generateIndex();