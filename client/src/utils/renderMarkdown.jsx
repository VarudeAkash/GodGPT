// Simple markdown renderer for AI responses
// Handles: ## headings, **bold**, *italic*, numbered lists, bullet lists, blank lines

export function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line or horizontal rule — skip
    if (!line.trim() || /^[-*_]{2,}\s*$/.test(line.trim())) {
      i++;
      continue;
    }

    // ## Heading 2
    if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="md-h2">{line.slice(3)}</h3>);
      i++;
      continue;
    }

    // # Heading 1
    if (line.startsWith('# ')) {
      elements.push(<h2 key={i} className="md-h1">{line.slice(2)}</h2>);
      i++;
      continue;
    }

    // ### Heading 3
    if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="md-h3">{line.slice(4)}</h4>);
      i++;
      continue;
    }

    // Numbered list block
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={i}>{inlineFormat(lines[i].replace(/^\d+\.\s/, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="md-ol">{items}</ol>);
      continue;
    }

    // Bullet list block
    if (/^[-*•]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
        items.push(<li key={i}>{inlineFormat(lines[i].replace(/^[-*•]\s/, ''))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="md-ul">{items}</ul>);
      continue;
    }

    // Regular paragraph
    elements.push(<p key={i} className="md-p">{inlineFormat(line)}</p>);
    i++;
  }

  return elements;
}

// Handle inline formatting: **bold**, *italic*, `code`
function inlineFormat(text) {
  const parts = [];
  // Split on **bold**, *italic*, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const raw = match[0];
    if (raw.startsWith('**')) {
      parts.push(<strong key={match.index}>{raw.slice(2, -2)}</strong>);
    } else if (raw.startsWith('*')) {
      parts.push(<em key={match.index}>{raw.slice(1, -1)}</em>);
    } else if (raw.startsWith('`')) {
      parts.push(<code key={match.index}>{raw.slice(1, -1)}</code>);
    }
    last = match.index + raw.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}
