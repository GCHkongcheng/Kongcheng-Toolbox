import type { Metadata } from "next";
import { SitePageShell } from "@/components/ui/site-page-shell";

export const metadata: Metadata = {
  title: "关于",
  description: "了解空城工具箱的产品定位、设计原则与后续迭代方向。",
};

const principles = [
  {
    title: "场景优先",
    description: "围绕真实任务组织功能，而不是堆叠模型能力。",
  },
  {
    title: "可复用",
    description: "模板、流程与输出结构都应可复制、可沉淀。",
  },
  {
    title: "渐进增强",
    description: "先打通关键链路，再迭代深度能力。",
  },
];

export default function AboutPage() {
  return (
    <SitePageShell
      title="关于空城工具箱"
      description="一个面向创作与开发场景的 AI 工具聚合平台。"
      maxWidthClassName="max-w-none"
    >
      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
        <article className="rounded-2xl border border-border bg-card p-6 lg:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Product Vision
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            把分散的 AI 能力整理成更顺手的工作台
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground lg:text-base">
            空城工具箱致力于把分散的 AI 能力整合成可持续迭代的工具矩阵。
            当前已上线 Prompt 模板管理器，并会逐步扩展写作、代码、文档与学习等模块，
            让常用能力以更稳定、更可复用的方式沉淀下来。
          </p>
        </article>

        <aside className="rounded-2xl border border-border bg-card p-6 lg:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Contact
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">合作与反馈</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            商务合作与反馈建议可通过后续开放的联系通道提交。当前仍在 Demo 阶段，
            欢迎持续关注版本更新。
          </p>
        </aside>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">设计原则</h2>
          <p className="text-sm text-muted-foreground">
            让每个页面不只是“能用”，而是更贴近真实工作流。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {principles.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </SitePageShell>
  );
}
