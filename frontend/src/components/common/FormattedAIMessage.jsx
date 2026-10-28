import { useMemo } from "react";
import { Sparkles, CheckCircle2, AlertCircle, TrendingUp, Info } from "lucide-react";

/**
 * Parses inline formatting like **bold**, *italic*, `code`, and currency ₹ amounts.
 */
function renderInlineContent(text) {
  if (!text) return null;

  // Split by bold (**text**), code (`text`), italic (*text*), and currency (₹...)
  // Tokenize regex
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|₹[\d,]+(?:\.\d+)?(?:\/\w+)?)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={idx} className="font-extrabold text-slate-900">
          {boldText}
        </strong>
      );
    }

    // Inline Code: `text`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={idx}
          className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={idx} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Currency highlight: ₹...
    if (part.startsWith("₹")) {
      return (
        <span
          key={idx}
          className="inline-flex items-center font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200/60 px-1.5 py-0.2 rounded-md mx-0.5 text-[11px] tracking-tight shadow-2xs"
        >
          {part}
        </span>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}

export default function FormattedAIMessage({ content = "", isUser = false }) {
  const parsedBlocks = useMemo(() => {
    if (!content) return [];
    const lines = content.split("\n");
    const blocks = [];
    let currentList = null;

    const flushList = () => {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        continue;
      }

      // 1. Heading 3: ### Heading
      if (trimmed.startsWith("### ")) {
        flushList();
        blocks.push({
          type: "heading3",
          text: trimmed.replace(/^###\s+/, ""),
        });
        continue;
      }

      // 2. Heading 2: ## Heading
      if (trimmed.startsWith("## ")) {
        flushList();
        blocks.push({
          type: "heading2",
          text: trimmed.replace(/^##\s+/, ""),
        });
        continue;
      }

      // 3. Blockquote / Callout: > Quote
      if (trimmed.startsWith("> ")) {
        flushList();
        blocks.push({
          type: "callout",
          text: trimmed.replace(/^>\s+/, ""),
        });
        continue;
      }

      // 4. Bullet lists: - item, * item, • item
      const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
      if (bulletMatch) {
        if (!currentList || currentList.type !== "bullet") {
          flushList();
          currentList = { type: "bullet", items: [] };
        }
        currentList.items.push(bulletMatch[1]);
        continue;
      }

      // 5. Numbered lists: 1. item
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        if (!currentList || currentList.type !== "numbered") {
          flushList();
          currentList = { type: "numbered", items: [] };
        }
        currentList.items.push(numberedMatch[2]);
        continue;
      }

      // 6. Regular paragraph
      flushList();
      blocks.push({
        type: "paragraph",
        text: trimmed,
      });
    }

    flushList();
    return blocks;
  }, [content]);

  if (isUser) {
    return <span className="text-white font-medium">{content}</span>;
  }

  return (
    <div className="space-y-3 text-xs leading-relaxed text-slate-800 font-normal">
      {parsedBlocks.map((block, idx) => {
        switch (block.type) {
          case "heading2":
            return (
              <h3
                key={idx}
                className="mt-3 text-sm font-extrabold text-[#00353f] border-b border-slate-100 pb-1 flex items-center gap-1.5"
              >
                <Sparkles size={14} className="text-emerald-600" />
                {renderInlineContent(block.text)}
              </h3>
            );

          case "heading3":
            return (
              <h4
                key={idx}
                className="mt-2.5 text-xs font-bold uppercase tracking-wider text-[#004d5b] flex items-center gap-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {renderInlineContent(block.text)}
              </h4>
            );

          case "callout":
            return (
              <div
                key={idx}
                className="my-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-3.5 text-xs text-emerald-950 flex items-start gap-2.5 shadow-2xs"
              >
                <Info size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">
                  {renderInlineContent(block.text)}
                </div>
              </div>
            );

          case "bullet":
            return (
              <ul key={idx} className="my-2 space-y-1.5 pl-0.5">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2 text-xs">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="flex-1 text-slate-700 leading-normal">
                      {renderInlineContent(item)}
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "numbered":
            return (
              <ol key={idx} className="my-2 space-y-2">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-xs">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-900 text-[10px] font-extrabold text-white">
                      {itemIdx + 1}
                    </span>
                    <span className="flex-1 text-slate-700 leading-normal pt-0.5">
                      {renderInlineContent(item)}
                    </span>
                  </li>
                ))}
              </ol>
            );

          case "paragraph":
          default:
            return (
              <p key={idx} className="text-slate-700 leading-relaxed">
                {renderInlineContent(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}

