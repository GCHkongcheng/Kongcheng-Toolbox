"use client";

import { useMemo, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  ClipboardPaste,
  Copy,
  Download,
  Eraser,
  FileImage,
  FileText,
  LoaderCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { ToolPageShell } from "@/components/ui/tool-page-shell";
import { normalizeMathMarkdown } from "@/lib/ai-export/math";

const defaultMarkdown = `# AI 内容导出示例

把 AI 输出内容直接粘贴到这里，然后选择导出为 Word 或图片。

## 支持的格式

- 标题与分级结构
- **加粗**、*斜体*、\`行内代码\`
- 无序列表和有序列表
- 表格与代码块

## 示例表格

| 模块 | 说明 | 状态 |
| --- | --- | --- |
| Word 导出 | 保留结构和基础样式 | 可用 |
| 图片导出 | 自动换行，长内容自动分页 | 可用 |

## 示例代码块

\`\`\`ts
function greet(name: string) {
  return \`你好，\${name}\`;
}
\`\`\`

> 长内容导出图片时，如果超过一页，会自动分页并打包成 ZIP 下载。
`;

const exportOptions = [
  {
    id: "docx",
    label: "Word 文档",
    hint: "导出为 .docx，适合继续编辑和归档",
    icon: FileText,
  },
  {
    id: "png",
    label: "PNG 图片",
    hint: "清晰无损，长内容会自动分页",
    icon: FileImage,
  },
  {
    id: "jpg",
    label: "JPG 图片",
    hint: "体积更小，适合快速分享",
    icon: FileImage,
  },
] as const;

type ExportOption = (typeof exportOptions)[number]["id"];

export default function AiRichExportPage() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [content, setContent] = useState(defaultMarkdown);
  const [selectedFormat, setSelectedFormat] = useState<ExportOption>("docx");
  const [isExporting, setIsExporting] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const characters = content.length;
    const lines = content.split(/\r?\n/).length;
    const words = content
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    return { characters, lines, words };
  }, [content]);

  const exportLabel = exportOptions.find((item) => item.id === selectedFormat)?.label;
  const previewContent = useMemo(() => normalizeMathMarkdown(content), [content]);

  const resetFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const focusTextarea = () => {
    textareaRef.current?.focus();
  };

  const handlePaste = async () => {
    if (!navigator.clipboard) {
      setError("当前浏览器不支持剪贴板读取，请手动粘贴。");
      return;
    }

    setIsPasting(true);
    resetFeedback();

    try {
      const clipboardText = await navigator.clipboard.readText();

      if (!clipboardText.trim()) {
        setError("剪贴板里暂时没有可粘贴的文本内容。");
        return;
      }

      setContent((current) => {
        if (!current.trim()) {
          return clipboardText;
        }

        return `${current.replace(/\s+$/, "")}\n\n${clipboardText}`;
      });
      setMessage("已从剪贴板粘贴内容。");
      requestAnimationFrame(focusTextarea);
    } catch {
      setError("无法读取剪贴板，请检查浏览器权限或手动粘贴。");
    } finally {
      setIsPasting(false);
    }
  };

  const handleCopy = async () => {
    if (!content.trim()) {
      setError("当前没有可复制的内容。");
      return;
    }

    if (!navigator.clipboard) {
      setError("当前浏览器不支持剪贴板写入。");
      return;
    }

    setIsCopying(true);
    resetFeedback();

    try {
      await navigator.clipboard.writeText(content);
      setMessage("当前内容已复制到剪贴板。");
    } catch {
      setError("复制失败，请稍后重试。");
    } finally {
      setIsCopying(false);
    }
  };

  const handleClear = () => {
    setContent("");
    resetFeedback();
    setMessage("内容已清空。");
    requestAnimationFrame(focusTextarea);
  };

  const handleRestoreSample = () => {
    setContent(defaultMarkdown);
    resetFeedback();
    setMessage("已恢复示例内容。");
    requestAnimationFrame(focusTextarea);
  };

  const handleCopyAsLongImage = async () => {
    if (!content.trim()) {
      setError("当前没有可复制为长图的内容。");
      return;
    }

    if (!previewRef.current) {
      setError("预览区尚未准备好，请稍后再试。");
      return;
    }

    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      setError("当前浏览器不支持图片写入剪贴板。");
      return;
    }

    setIsCopyingImage(true);
    resetFeedback();

    try {
      if ("fonts" in document) {
        await document.fonts.ready;
      }

      const blob = await toBlob(previewRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        width: previewRef.current.scrollWidth,
        height: previewRef.current.scrollHeight,
      });

      if (!blob) {
        throw new Error("无法生成预览长图。");
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      setMessage("右侧预览已复制为长图到剪贴板。");
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError.message
          : "复制长图失败，请稍后重试。";
      setError(nextError);
    } finally {
      setIsCopyingImage(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    resetFeedback();

    try {
      const response = await fetch("/api/tools/ai-rich-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          format: selectedFormat,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "导出失败，请稍后重试。");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const fileName =
        disposition
          ?.match(/filename\*=UTF-8''([^;]+)/)?.[1]
          ?.trim()
          ?.replaceAll('"', "") ?? `ai-export.${selectedFormat}`;

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = decodeURIComponent(fileName);
      anchor.click();
      URL.revokeObjectURL(objectUrl);

      setMessage(
        selectedFormat === "docx"
          ? "Word 文档已生成并开始下载。"
          : "图片已生成并开始下载；长内容会自动分页。",
      );
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error ? caughtError.message : "导出失败，请稍后重试。";
      setError(nextError);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ToolPageShell
      title="AI 内容导出器"
      subtitle="把 AI 输出内容直接粘贴进来，实时预览后导出为 Word 或分页图片。"
      status="已上线"
      maxWidthClassName="max-w-7xl"
    >
      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[28px] border border-border bg-card/95 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">内容输入</p>
              <p className="mt-1 text-sm text-muted-foreground">
                支持 Markdown 风格内容。纯文本也可以直接粘贴。
              </p>
            </div>
            <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
              {stats.characters.toLocaleString()} 字符 / {stats.lines} 行
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePaste}
              disabled={isPasting}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ClipboardPaste size={15} />
              {isPasting ? "正在粘贴..." : "一键粘贴"}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={isCopying || content.trim().length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Copy size={15} />
              {isCopying ? "正在复制..." : "复制内容"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={content.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Eraser size={15} />
              清空
            </button>

            <button
              type="button"
              onClick={handleRestoreSample}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-accent"
            >
              <RotateCcw size={15} />
              恢复示例
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              if (message || error) {
                resetFeedback();
              }
            }}
            className="mt-4 min-h-[560px] w-full resize-y rounded-[22px] border border-border bg-background px-4 py-4 text-sm leading-7 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
            placeholder="把 AI 输出内容粘贴到这里..."
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-border bg-background/70 px-4 py-3 text-xs leading-5 text-muted-foreground">
            <div>
              小提示：支持直接粘贴 AI 回答、Markdown 草稿或纯文本内容。
            </div>
            <div>
              支持 `$...$`、`$$...$$`，也兼容旧式 `[` `]` 公式块。
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-dashed border-border bg-background/80 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles size={16} className="text-primary" />
              导出设置
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                const active = option.id === selectedFormat;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedFormat(option.id)}
                    className={`rounded-[20px] border px-4 py-4 text-left transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card hover:border-primary/40 hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={18} />
                      <span className="text-sm font-semibold">{option.label}</span>
                    </div>
                    <p
                      className={`mt-2 text-xs leading-5 ${
                        active ? "text-primary-foreground/85" : "text-muted-foreground"
                      }`}
                    >
                      {option.hint}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs leading-5 text-muted-foreground">
                当前导出：{exportLabel}
                <br />
                图片超出一页时，会自动拆分多页并打包下载。
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAsLongImage}
                  disabled={isCopyingImage || content.trim().length === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCopyingImage ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <FileImage size={16} />
                  )}
                  {isCopyingImage ? "正在复制..." : "复制为长图"}
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting || content.trim().length === 0}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isExporting ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {isExporting ? "正在生成..." : "开始导出"}
                </button>
              </div>
            </div>

            {message ? (
              <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {message}
              </p>
            ) : null}

            {error ? (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-card/95 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">实时预览</p>
              <p className="mt-1 text-sm text-muted-foreground">
                预览样式会尽量贴近导出效果，方便检查结构和排版。
              </p>
            </div>
            <div className="rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
              {stats.words.toLocaleString()} 词
            </div>
          </div>

          <div className="ai-export-preview-stage mt-4 min-h-[560px] overflow-auto rounded-[22px] border border-border p-4 md:p-5">
            <div ref={previewRef} className="ai-export-preview-page">
              <div className="markdown-renderer">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {content.trim().length > 0 ? previewContent : "请输入内容后即可预览。"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ToolPageShell>
  );
}
