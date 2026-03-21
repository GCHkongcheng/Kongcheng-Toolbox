export type ToolModule = "prompt" | "writing" | "code" | "docs" | "learning";

export interface ToolManifest {
  id: string;
  module: ToolModule;
  name: string;
  summary: string;
  status: "已上线" | "开发中";
  tags?: string[];
}
