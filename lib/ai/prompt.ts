interface PageContext {
  title?: string;
  description?: string;
  content?: string;
  slug?: string;
}

/**
 * 构建系统消息，包含页面上下文
 * @param customSystem - 自定义系统消息 (可选)
 * @param pageContext - 当前页面上下文 (可选)
 * @returns 完整的系统消息字符串
 */
export function buildSystemMessage(
  customSystem?: string,
  pageContext?: PageContext,
): string {
  // 默认系统消息
  let systemMessage =
    customSystem ||
    `You are a helpful AI assistant for a documentation website. 
    You can help users understand the documentation, answer questions about the content, 
    and provide guidance on the topics covered in the docs. Be concise and helpful.`;

  // 如果当前页面上下文可用，则添加到系统消息中
  if (pageContext?.content) {
    systemMessage += `\n\n--- CURRENT PAGE CONTEXT ---\n`;

    if (pageContext.title) {
      systemMessage += `Page Title: ${pageContext.title}\n`;
    }

    if (pageContext.description) {
      systemMessage += `Page Description: ${pageContext.description}\n`;
    }

    if (pageContext.slug) {
      systemMessage += `Page URL: /docs/${pageContext.slug}\n`;
    }

    systemMessage += `Page Content:\n${pageContext.content}`;
    systemMessage += `\n--- END OF CONTEXT ---\n\nWhen users ask about "this page", "current page", or refer to the content they're reading, use the above context to provide accurate answers. You can summarize, explain, or answer specific questions about the current page content.`;
  }

  return systemMessage;
}
