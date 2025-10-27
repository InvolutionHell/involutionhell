import { Github, MessageCircle, ExternalLink } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { LicenseNotice } from "./LicenseNotice";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <BrandMark
              className="mb-4 gap-3"
              textClassName="font-bold text-xl"
            />
            <p className="text-muted-foreground mb-6 max-w-md">
              一个由开发者自发组织的、完全免费且开放的学习社区。让每个人都能在轻松氛围下成长。
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/involutionhell"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="访问 Involution Hell 的 GitHub"
                title="访问 GitHub"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-card border border-border hover:bg-accent hover:scale-110 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Github className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">访问 GitHub</span>
              </a>
              <a
                href="https://discord.com/invite/6CGP73ZWbD"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="加入 Discord 社区"
                title="加入 Discord"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-card border border-border hover:bg-accent hover:scale-110 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">加入 Discord 社区</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://involutionhell.github.io/docs/ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                >
                  知识库
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  特点
                </a>
              </li>
              <li>
                <a
                  href="https://www.zotero.org/groups/6053219/unsw_ai/library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                >
                  文献资料库
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="#community"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  社区
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">联系我们</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/involutionhell/involutionhell.github.io/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                >
                  提交 Issue
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com/invite/6CGP73ZWbD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                >
                  Discord 社区
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
          <p>完全开源，永远免费</p>
          <LicenseNotice className="mt-2" />
        </div>
      </div>
    </footer>
  );
}
