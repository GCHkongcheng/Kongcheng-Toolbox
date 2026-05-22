import type { Metadata } from "next";
import { SitePageShell } from "@/components/ui/site-page-shell";

export const metadata: Metadata = {
  title: "关于",
  description: "了解空城工具箱的产品定位、设计原则与后续迭代方向。",
};

export default function AboutPage() {
  return (
    <SitePageShell
      title="关于空城工具箱"
      description="一个面向创作与开发场景的 AI 工具聚合平台。"
      maxWidthClassName="max-w-4xl"
    >
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">我们在做什么</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            空城工具箱致力于把分散的 AI 能力整合成可持续迭代的工具矩阵。
            当前已上线 Prompt
            模板管理器，并逐步扩展写作、代码、文档与学习等模块。
          </p>

          <h2 className="mt-6 text-lg font-semibold">设计原则</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>场景优先：围绕真实任务组织功能，而不是堆叠模型能力。</li>
            <li>可复用：模板、流程、输出结构都应可复制、可沉淀。</li>
            <li>渐进增强：先打通关键链路，再迭代深度能力。</li>
          </ul>

          <h2 className="mt-6 text-lg font-semibold">联系方式</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            商务合作与反馈建议可通过后续开放的联系通道提交。 当前为 Demo
            阶段，欢迎持续关注版本更新。
          </p>
        </section>
    </SitePageShell>
  );
}
