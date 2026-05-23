"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  Copy,
  Download,
  Eraser,
  FileImage,
  FileText,
  LoaderCircle,
  RotateCcw,
  X,
} from "lucide-react";
import { ToolPageShell } from "@/components/ui/tool-page-shell";
import { normalizeMathMarkdown } from "@/lib/ai-export/math";

const defaultMarkdown = `# AI 内容导出示例

把 AI 输出内容直接粘贴到这里，然后选择导出为 Word、PDF 或图片。

## 支持的格式
- 标题与分级结构、**加粗**、*斜体*、\`行内代码\`
- 无序列表和有序列表、表格与代码块
- 数学公式：$E = mc^2$，也支持独立公式块

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

> 长内容导出图片时，如果超过一页，会自动分页并打包成 ZIP 下载。`;

const exportOptions = [
  {
    id: "docx",
    label: "Word",
    title: "Word 文档",
    hint: "适合继续编辑、归档和二次排版",
    icon: FileText,
  },
  {
    id: "pdf",
    label: "PDF",
    title: "PDF 文档",
    hint: "适合打印、分发和固定版式",
    icon: FileText,
  },
  {
    id: "png",
    label: "PNG",
    title: "PNG 图片",
    hint: "清晰无损，长内容自动分页",
    icon: FileImage,
  },
  {
    id: "jpg",
    label: "JPG",
    title: "JPG 图片",
    hint: "体积更小，适合快速分享",
    icon: FileImage,
  },
] as const;

const previewOptions = [
  {
    id: "web",
    label: "网页预览",
    hint: "适合快速检查 Markdown 结构",
  },
  {
    id: "a4",
    label: "A4 预览",
    hint: "接近 PDF 和分页图片效果",
  },
  {
    id: "long",
    label: "长图预览",
    hint: "用于检查复制长图效果",
  },
] as const;

type ExportOption = (typeof exportOptions)[number]["id"];
type PreviewMode = (typeof previewOptions)[number]["id"];
type DraftPayload = {
  content: string;
  selectedFormat: ExportOption;
  updatedAt: string;
};

const DRAFT_STORAGE_KEY = "ai-rich-export:draft:v1";

function isExportOption(value: unknown): value is ExportOption {
  return exportOptions.some((option) => option.id === value);
}

export default function AiRichExportPage() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const hasRestoredDraftRef = useRef(false);
  const [content, setContent] = useState(defaultMarkdown);
  const [selectedFormat, setSelectedFormat] = useState<ExportOption>("docx");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("a4");
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

  const selectedOption =
    exportOptions.find((item) => item.id === selectedFormat) ?? exportOptions[0];
  const selectedPreviewOption =
    previewOptions.find((item) => item.id === previewMode) ?? previewOptions[1];
  const previewContent = useMemo(() => normalizeMathMarkdown(content), [content]);
  useEffect(() => {
    try {
      const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);

      if (!rawDraft) {
        hasRestoredDraftRef.current = true;
        return;
      }

      const parsed = JSON.parse(rawDraft) as Partial<DraftPayload>;

      if (typeof parsed.content === "string") {
        setContent(parsed.content);
      }

      if (isExportOption(parsed.selectedFormat)) {
        setSelectedFormat(parsed.selectedFormat);
      }

      if (
        typeof parsed.content === "string" &&
        parsed.content !== defaultMarkdown
      ) {
        setMessage("已自动恢复上次未完成的草稿。");
      }
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } finally {
      hasRestoredDraftRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredDraftRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const updatedAt = new Date().toISOString();
      const payload: DraftPayload = {
        content,
        selectedFormat,
        updatedAt,
      };

      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Ignore storage quota and private-mode failures; exporting should still work.
      }
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [content, selectedFormat]);

  useEffect(() => {
    if (!message && !error) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => {
        resetFeedback();
      },
      error ? 5200 : 3600,
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [error, message]);

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
          "Content-Type": "application/json; charset=utf-8",
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
          : selectedFormat === "pdf"
            ? "PDF 文档已生成并开始下载。"
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

  const exportPanel = (
    <div className="ai-export-header-actions flex max-w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start md:flex-nowrap md:justify-end">
      <button
        type="button"
        onClick={handleCopyAsLongImage}
        disabled={isCopyingImage || content.trim().length === 0}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-3 text-sm font-bold text-foreground transition hover:border-slate-400 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5"
      >
        {isCopyingImage ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <FileImage size={16} />
        )}
        {isCopyingImage ? "复制中" : "复制预览长图"}
      </button>

      <label htmlFor="export-format" className="sr-only">
        导出格式
      </label>
      <select
        id="export-format"
        value={selectedFormat}
        title={selectedOption.hint}
        onChange={(event) => setSelectedFormat(event.target.value as ExportOption)}
        className="h-10 w-full min-w-0 rounded-full border border-border bg-background px-4 pr-9 text-sm font-bold text-foreground outline-none transition hover:border-foreground/30 focus:border-foreground/50 focus:ring-4 focus:ring-foreground/10 sm:w-auto sm:min-w-36"
      >
        {exportOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.title}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting || content.trim().length === 0}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-950/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5"
      >
        {isExporting ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {isExporting ? "生成中" : "开始导出"}
      </button>
    </div>
  );

  return (
    <ToolPageShell
      title="AI 内容导出器"
      subtitle="粘贴 AI 回复、Markdown 草稿或普通文本，实时预览后导出为 Word、PDF 或分页图片。"
      status="已上线"
      headerActions={exportPanel}
      maxWidthClassName="max-w-none"
    >
      {message || error ? (
        <div className="fixed left-3 right-3 top-16 z-50 md:left-auto md:right-8 md:top-20 md:max-w-[calc(100vw-2rem)]">
          <div
            role={error ? "alert" : "status"}
            aria-live={error ? "assertive" : "polite"}
            className={`flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${
              error
                ? "border-rose-200 bg-rose-50/95 text-rose-800 shadow-rose-950/10"
                : "border-emerald-200 bg-emerald-50/95 text-emerald-800 shadow-emerald-950/10"
            }`}
          >
            {error ? (
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
            ) : (
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            )}
            <p className="min-w-0 flex-1 font-medium leading-5">
              {error ?? message}
            </p>
            <button
              type="button"
              onClick={resetFeedback}
              className="rounded-full p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
              aria-label="关闭提示"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid min-w-0 items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,0.96fr)_minmax(560px,1.04fr)] 2xl:grid-cols-[minmax(720px,0.95fr)_minmax(720px,1.05fr)]">
        <section className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm sm:rounded-[30px]">
            <div className="border-b border-border/70 bg-muted/30 px-4 py-4 sm:px-5 lg:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-foreground">内容输入</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    支持 Markdown，也可以直接粘贴普通文本。
                  </p>
                </div>
                <div className="grid w-full grid-cols-3 overflow-hidden rounded-2xl border border-border bg-background text-center text-xs sm:w-auto">
                  <div className="px-2 py-2 sm:px-3">
                    <p className="font-bold text-foreground">
                      {stats.characters.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">字符</p>
                  </div>
                  <div className="border-x border-border px-2 py-2 sm:px-3">
                    <p className="font-bold text-foreground">{stats.lines}</p>
                    <p className="text-muted-foreground">行</p>
                  </div>
                  <div className="px-2 py-2 sm:px-3">
                    <p className="font-bold text-foreground">
                      {stats.words.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">词段</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  onClick={handlePaste}
                  disabled={isPasting}
                  className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-border bg-background px-2 py-2 text-sm font-semibold text-foreground transition hover:border-slate-400 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:px-3"
                >
                  <ClipboardPaste size={15} />
                  {isPasting ? "正在粘贴..." : "一键粘贴"}
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={isCopying || content.trim().length === 0}
                  className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-border bg-background px-2 py-2 text-sm font-semibold text-foreground transition hover:border-slate-400 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:px-3"
                >
                  <Copy size={15} />
                  {isCopying ? "正在复制..." : "复制内容"}
                </button>

                <button
                  type="button"
                  onClick={handleRestoreSample}
                  className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-border bg-background px-2 py-2 text-sm font-semibold text-foreground transition hover:border-slate-400 hover:bg-accent sm:px-3"
                >
                  <RotateCcw size={15} />
                  恢复示例
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={content.length === 0}
                  className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-transparent px-2 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3"
                >
                  <Eraser className="shrink-0" size={15} />
                  <span className="truncate">清空</span>
                </button>
              </div>
            </div>

            <div className="bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.09),transparent_30%),linear-gradient(180deg,#ffffff,#fffdf8)] p-3 sm:p-4 lg:p-5">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(event) => {
                  setContent(event.target.value);
                  if (message || error) {
                    resetFeedback();
                  }
                }}
                className="min-h-[360px] w-full max-w-full resize-y rounded-[20px] border border-amber-100 bg-white/90 px-3 py-3 font-mono text-sm leading-7 text-slate-800 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100 sm:min-h-[520px] sm:rounded-[24px] sm:px-4 sm:py-4 2xl:min-h-[640px]"
                placeholder="把 AI 输出内容粘贴到这里..."
              />

              <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-600 md:mt-4 md:grid-cols-2 md:gap-3">
                <div className="rounded-2xl border border-amber-100 bg-white/80 px-4 py-3">
                  小提示：适合粘贴 ChatGPT、Claude、通义等 AI 回答，也支持 Markdown 草稿。
                </div>
                <div className="rounded-2xl border border-sky-100 bg-white/80 px-4 py-3">
                  数学公式支持 `$...$`、`$$...$$`，也兼容旧式 `[` `]` 公式块。
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="min-w-0 xl:sticky xl:top-6">
          <section className="rounded-[24px] border border-border bg-card p-4 shadow-sm sm:rounded-[30px] sm:p-5 lg:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-foreground">导出效果预览</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedPreviewOption.hint}
                </p>
              </div>
              <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                <label htmlFor="preview-mode" className="sr-only">
                  预览模式
                </label>
                <select
                  id="preview-mode"
                  value={previewMode}
                  onChange={(event) =>
                    setPreviewMode(event.target.value as PreviewMode)
                  }
                  className="h-9 min-w-0 flex-1 rounded-full border border-border bg-background px-3 pr-8 text-xs font-bold text-foreground shadow-sm outline-none transition hover:border-foreground/30 focus:border-foreground/50 focus:ring-4 focus:ring-foreground/10 sm:flex-none"
                >
                  {previewOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="hidden rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground sm:block">
                  {stats.words.toLocaleString()} 词段
                </div>
              </div>
            </div>

            <div
              className={`ai-export-preview-stage ai-export-preview-stage--${previewMode} mt-4 overflow-auto rounded-[22px] border border-border p-2 sm:rounded-[26px] sm:p-4 md:p-5`}
            >
              <div
                ref={previewRef}
                className={`ai-export-preview-page ai-export-preview-page--${previewMode}`}
              >
                <div className="markdown-renderer">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {content.trim().length > 0
                      ? previewContent
                      : "请输入内容后即可预览。"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </ToolPageShell>
  );
}
