export type ToolModule = "prompt" | "writing" | "code" | "docs" | "learning";
export const toolStatuses = ["已上线", "开发中"] as const;
export type ToolStatus = (typeof toolStatuses)[number];

export interface ToolManifest {
  id: string;
  module: ToolModule;
  name: string;
  summary: string;
  status: ToolStatus;
  tags?: string[];
}
