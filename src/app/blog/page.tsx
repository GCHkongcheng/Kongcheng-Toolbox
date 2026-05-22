import type { Metadata } from "next";
import { SitePageShell } from "@/components/ui/site-page-shell";

export const metadata: Metadata = {
  title: "博客",
  description: "记录空城工具箱的产品迭代、使用技巧与设计思考。",
};

const posts = [
  {
    slug: "product-roadmap-q2",
    title: "空城工具箱 Q2 产品路线图",
    excerpt: "介绍 Prompt 管理器增强计划，以及写作助手、代码生成模块的里程碑。",
    date: "2026-03-16",
    tag: "产品更新",
  },
  {
    slug: "prompt-template-best-practice",
    title: "Prompt 模板管理最佳实践",
    excerpt: "如何建立可复用模板体系，提升团队协作效率与输出稳定性。",
    date: "2026-03-10",
    tag: "使用指南",
  },
  {
    slug: "toolbox-design-notes",
    title: "工具聚合首页设计笔记",
    excerpt: "记录空城工具箱从单工具到多模块聚合的设计思路。",
    date: "2026-03-06",
    tag: "设计",
  },
];

export default function BlogPage() {
  return (
    <SitePageShell
      title="博客"
      description="记录产品迭代、使用技巧与设计思考。"
      maxWidthClassName="max-w-5xl"
    >
        <div className="space-y-4">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.tag}</span>
              </div>
              <h2 className="mt-2 text-lg font-semibold tracking-tight">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
              <button
                className="mt-3 inline-flex rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                type="button"
              >
                阅读详情（即将上线）
              </button>
            </article>
          ))}
        </div>
    </SitePageShell>
  );
}
