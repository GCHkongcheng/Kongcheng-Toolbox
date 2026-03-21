import { registeredToolManifests } from "@/lib/tool-registry.generated";

export type ModuleId = "prompt" | "writing" | "code" | "docs" | "learning";

export interface ModuleMeta {
  id: ModuleId;
  title: string;
  subtitle: string;
  status: "已上线" | "开发中";
  features: string[];
}

export interface PromptTemplate {
  id: number;
  title: string;
  description: string;
  category: "prompt";
  tags: string[];
  starred: boolean;
  usageCount: number;
}

export interface ToolDemo {
  id: string;
  name: string;
  category: ModuleId;
  summary: string;
  status: "已上线" | "开发中";
  path?: string;
}

export const moduleMetas: ModuleMeta[] = [
  {
    id: "prompt",
    title: "Prompt 模板管理器",
    subtitle: "管理、检索和复用高质量 Prompt 模板。",
    status: "已上线",
    features: [
      "模板分类与标签检索",
      "收藏高频模板",
      "一键复制与快速复用",
      "后续将支持团队模板共享",
    ],
  },
  {
    id: "writing",
    title: "写作助手",
    subtitle: "从构思到润色的全流程写作辅助工具。",
    status: "开发中",
    features: [
      "主题自动生成文章大纲",
      "多风格文案改写",
      "语气和长度可控输出",
      "后续将支持品牌语料微调",
    ],
  },
  {
    id: "code",
    title: "代码生成",
    subtitle: "面向开发场景的代码生成与重构工具箱。",
    status: "开发中",
    features: [
      "常见业务模板生成",
      "代码审查建议",
      "注释与文档自动补全",
      "后续将接入仓库上下文分析",
    ],
  },
  {
    id: "docs",
    title: "文档处理",
    subtitle: "结构化整理、转换与提炼文档内容。",
    status: "开发中",
    features: [
      "多格式文档互转",
      "会议纪要自动抽取",
      "长文摘要与关键点提炼",
      "后续将支持知识库入库",
    ],
  },
  {
    id: "learning",
    title: "学习辅助",
    subtitle: "根据学习目标生成计划、题目和复盘建议。",
    status: "开发中",
    features: [
      "知识点测验生成",
      "错题复盘建议",
      "阶段学习计划制定",
      "后续将支持个性化难度曲线",
    ],
  },
];

export const moduleMap: Record<ModuleId, ModuleMeta> = moduleMetas.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<ModuleId, ModuleMeta>,
);

export const promptTemplates: PromptTemplate[] = [
  {
    id: 1,
    title: "技术博客文章生成器",
    description:
      "根据主题自动生成结构清晰的技术博客文章，包含引言、正文和总结。",
    category: "prompt",
    tags: ["博客", "技术文章", "SEO"],
    starred: true,
    usageCount: 128,
  },
  {
    id: 2,
    title: "代码 Review 助手",
    description:
      "对提交的代码片段进行全面审查，指出潜在问题、安全隐患并给出优化建议。",
    category: "prompt",
    tags: ["Code Review", "安全", "最佳实践"],
    starred: true,
    usageCount: 96,
  },
  {
    id: 3,
    title: "会议纪要整理",
    description:
      "将杂乱的会议记录整理成结构化的会议纪要，包含决策事项和行动计划。",
    category: "prompt",
    tags: ["会议", "文档", "整理"],
    starred: false,
    usageCount: 74,
  },
  {
    id: 4,
    title: "SQL 查询优化器",
    description:
      "分析 SQL 查询语句并给出性能优化建议，自动生成更高效的替代方案。",
    category: "prompt",
    tags: ["SQL", "数据库", "性能"],
    starred: false,
    usageCount: 61,
  },
  {
    id: 5,
    title: "竞品分析报告",
    description:
      "基于提供的信息，生成专业的竞品分析报告，涵盖功能对比和市场定位。",
    category: "prompt",
    tags: ["分析", "商业", "报告"],
    starred: true,
    usageCount: 55,
  },
  {
    id: 6,
    title: "API 文档生成器",
    description: "根据代码注释或接口描述，自动生成标准的 RESTful API 文档。",
    category: "prompt",
    tags: ["API", "文档", "开发"],
    starred: false,
    usageCount: 43,
  },
  {
    id: 7,
    title: "产品需求文档 (PRD)",
    description:
      "根据产品想法快速生成标准 PRD 文档，包含功能描述、用户故事和验收标准。",
    category: "prompt",
    tags: ["PRD", "产品", "需求"],
    starred: false,
    usageCount: 38,
  },
  {
    id: 8,
    title: "数据趋势解读",
    description: "输入数据集描述，生成专业的数据趋势分析和可视化建议。",
    category: "prompt",
    tags: ["数据分析", "趋势", "可视化"],
    starred: false,
    usageCount: 29,
  },
];

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
