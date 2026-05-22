import type { ToolStatus } from "@/lib/tool-manifest";

export type ModuleId = "prompt" | "writing" | "code" | "docs" | "learning";

export const moduleIds = [
  "prompt",
  "writing",
  "code",
  "docs",
  "learning",
] as const satisfies readonly ModuleId[];

export interface ModuleMeta {
  id: ModuleId;
  title: string;
  subtitle: string;
  status: ToolStatus;
  features: string[];
}

export const moduleMetas: ModuleMeta[] = [
  {
    id: "prompt",
    title: "模板管理器",
    subtitle: "统一管理 Prompt、变量模板与团队模板资产。",
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

export function isModuleId(value: string): value is ModuleId {
  return moduleIds.includes(value as ModuleId);
}

export function getModuleMeta(moduleId: ModuleId) {
  return moduleMap[moduleId];
}

export function getModuleTitle(moduleId: ModuleId) {
  return moduleMap[moduleId].title;
}
