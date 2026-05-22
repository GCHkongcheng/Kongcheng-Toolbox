import type { ModuleId } from "@/lib/tool-modules";

interface ModuleFeatureCard {
  title: string;
  description: string;
}

interface EmbeddedModulePageConfig {
  subtitle: string;
  cards: ModuleFeatureCard[];
  externalUrl: string;
  embedUrl: string;
  embedTitle: string;
}

interface PlaceholderModulePageConfig {
  statusNote: string;
}

export interface ModulePageConfig {
  embedded?: EmbeddedModulePageConfig;
  placeholder?: PlaceholderModulePageConfig;
}

export const modulePageConfigs: Partial<Record<ModuleId, ModulePageConfig>> = {
  prompt: {
    embedded: {
      subtitle: "已接入独立站点，支持在当前页面直接访问。",
      cards: [
        {
          title: "Prompt 模板管理器",
          description: "已上线，支持模板检索、标签筛选和快速复用。",
        },
        {
          title: "变量模板工坊",
          description: "开发中，用于变量占位与批量生成场景。",
        },
        {
          title: "团队模板库",
          description: "规划中，支持团队共享、审核与版本管理。",
        },
      ],
      externalUrl: "https://prompt.283947.xyz",
      embedUrl: "https://prompt.283947.xyz",
      embedTitle: "Prompt 模板管理器",
    },
  },
  writing: {
    placeholder: {
      statusNote:
        "当前页面为二级模块占位 Demo，用于先打通“工具聚合首页 → 模块详情页”的导航链路。后续将接入真实写作流程与结果编辑能力。",
    },
  },
  code: {
    placeholder: {
      statusNote:
        "当前页面为二级模块占位 Demo，用于先打通“工具聚合首页 → 模块详情页”的导航链路。后续将接入代码生成、重构与审查场景。",
    },
  },
  docs: {
    placeholder: {
      statusNote:
        "当前页面为二级模块占位 Demo，用于先打通“工具聚合首页 → 模块详情页”的导航链路。后续将接入文档转换、提炼与整理能力。",
    },
  },
  learning: {
    placeholder: {
      statusNote:
        "当前页面为二级模块占位 Demo，用于先打通“工具聚合首页 → 模块详情页”的导航链路。后续将接入学习计划、测验与复盘能力。",
    },
  },
};
