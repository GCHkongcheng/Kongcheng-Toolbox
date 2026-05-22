import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown 在线预览",
  description: "在空城工具箱中实时编辑和预览 Markdown，适合文档草稿与格式校对。",
};

export default function MarkdownPreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
