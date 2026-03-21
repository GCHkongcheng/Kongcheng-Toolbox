import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Kongcheng Toolbox
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              关于空城工具箱
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              一个面向创作与开发场景的 AI 工具聚合平台。
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              首页
            </Link>
            <Link href="/tools" className="hover:text-foreground">
              模块总览
            </Link>
            <a
              href="https://blog.gchkc.top"
              className="hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              博客
            </a>
          </div>
        </header>

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
      </div>
    </main>
  );
}
