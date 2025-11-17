/**
 * Utility functions for rendering HTML content in posts
 */

const htmlTagRegex = /<\/?[a-z][\s\S]*>/i;

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const applyInlineFormatting = (value: string) => {
  let result = escapeHtml(value);
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  result = result.replace(/\*(?!\*)(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/_(?!_)(.+?)_/g, '<em>$1</em>');
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');
  result = result.replace(
    /\[(.+?)]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return result;
};

const markdownToHtml = (markdown: string): string => {
  const lines = markdown.split(/\r?\n/);
  const htmlParts: string[] = [];
  let listOpen = false;
  let blockquoteOpen = false;

  const closeList = () => {
    if (listOpen) {
      htmlParts.push('</ul>');
      listOpen = false;
    }
  };

  const closeBlockquote = () => {
    if (blockquoteOpen) {
      htmlParts.push('</blockquote>');
      blockquoteOpen = false;
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      closeBlockquote();
      return;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      closeBlockquote();
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level}>${applyInlineFormatting(headingMatch[2].trim())}</h${level}>`);
      return;
    }

    if (line.startsWith('>')) {
      closeList();
      if (!blockquoteOpen) {
        htmlParts.push('<blockquote>');
        blockquoteOpen = true;
      }
      htmlParts.push(`<p>${applyInlineFormatting(line.replace(/^>\s?/, ''))}</p>`);
      return;
    }

    if (/^[-*+]\s+/.test(line)) {
      closeBlockquote();
      if (!listOpen) {
        htmlParts.push('<ul>');
        listOpen = true;
      }
      htmlParts.push(`<li>${applyInlineFormatting(line.replace(/^[-*+]\s+/, ''))}</li>`);
      return;
    }

    closeList();
    closeBlockquote();
    htmlParts.push(`<p>${applyInlineFormatting(line)}</p>`);
  });

  closeList();
  closeBlockquote();

  return htmlParts.join('');
};

/**
 * Converts content to HTML if needed.
 * If content already contains HTML tags, returns it as-is.
 * Otherwise, converts markdown to HTML.
 * Returns null if content is empty.
 */
export const getRichTextHtml = (content?: string | null): string | null => {
  if (!content) return null;
  const trimmed = content.trim();
  if (!trimmed) return null;
  if (htmlTagRegex.test(trimmed)) {
    return trimmed;
  }
  return markdownToHtml(trimmed);
};

/**
 * Checks if content contains HTML tags
 */
export const isHtmlContent = (content?: string | null): boolean => {
  if (!content) return false;
  return htmlTagRegex.test(content.trim());
};
