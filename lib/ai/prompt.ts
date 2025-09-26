interface PageContext {
  title?: string;
  description?: string;
  content?: string;
  slug?: string;
}

/**
 * Build system message with page context for AI assistant
 * @param customSystem - Custom system message (optional)
 * @param pageContext - Current page context (optional)
 * @returns Complete system message string
 */
export function buildSystemMessage(
  customSystem?: string,
  pageContext?: PageContext,
): string {
  // Default system message for documentation assistant
  let systemMessage =
    customSystem ||
    `You are a helpful AI assistant for a documentation website. 
    You can help users understand the documentation, answer questions about the content, 
    and provide guidance on the topics covered in the docs. Be concise and helpful.`;

  // Add current page context if available
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
