import { registeredToolManifests } from "@/lib/tool-registry.generated";
import type { ToolStatus } from "@/lib/tool-manifest";
import type { ModuleId } from "@/lib/module-catalog";

export interface ToolDemo {
  id: string;
  name: string;
  category: ModuleId;
  summary: string;
  status: ToolStatus;
  path?: string;
}

const builtInToolDemos: ToolDemo[] = [
  {
    id: "prompt-manager",
    name: "Prompt 模板管理器",
    category: "prompt",
    summary: "集中管理、检索与复用 Prompt 模板，支持标签与收藏。",
    status: "已上线",
  },
  {
    id: "writing-outline",
    name: "写作大纲助手",
    category: "writing",
    summary: "输入主题后快速生成文章大纲与段落建议。",
    status: "开发中",
  },
  {
    id: "code-snippet",
    name: "代码片段工坊",
    category: "code",
    summary: "按场景生成可复用代码片段并附带注释。",
    status: "开发中",
  },
  {
    id: "doc-convert",
    name: "文档格式转换",
    category: "docs",
    summary: "支持 Markdown、HTML、纯文本之间快速转换。",
    status: "开发中",
  },
  {
    id: "study-quiz",
    name: "学习测验生成器",
    category: "learning",
    summary: "根据知识点自动生成测验题与答案解析。",
    status: "开发中",
  },
];

const registeredToolDemos: ToolDemo[] = registeredToolManifests.map((tool) => ({
  id: tool.id,
  name: tool.name,
  category: tool.module,
  summary: tool.summary,
  status: tool.status,
  path: `/tools/${tool.id}`,
}));

export const toolDemos: ToolDemo[] = Array.from(
  new Map(
    [...builtInToolDemos, ...registeredToolDemos].map((tool) => [
      tool.id,
      tool,
    ]),
  ).values(),
);
