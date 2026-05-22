export interface PromptTemplate {
  id: number;
  title: string;
  description: string;
  category: "prompt";
  tags: string[];
  starred: boolean;
  usageCount: number;
}

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
