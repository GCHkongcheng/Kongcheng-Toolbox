# 工具接入模板与开发规范

## 1. 当前项目耦合状态（结论）

当前是“集中式配置驱动”架构，优点是简单，缺点是不支持工具文件夹即插即用。

现状依据：

- 模块 ID 与数据集中定义在 `src/lib/tool-modules.ts`。
- 工具总览页通过 `moduleMetas` 渲染：`src/app/tools/page.tsx`。
- 首页通过 `toolDemos` 过滤渲染：`src/app/page.tsx`。
- 模块详情页通过 `moduleMap[module as ModuleId]` 获取元信息：`src/app/tools/[module]/page.tsx`。

这意味着：新增工具不仅要加文件夹，还要改集中配置文件，属于“中度耦合”。

## 2. 建议目标（面向多 agent 并行开发）

建议把未来新工具统一成“工具包目录约定”，每个工具一个文件夹：

```txt
src/tools/<tool-id>/
  manifest.ts
  page.tsx
  service.ts (可选)
  README.md
```

其中：

- `manifest.ts` 提供工具元信息，供列表页自动读取。
- `page.tsx` 是工具页面入口（可直接复制到 app 路由内使用）。
- `service.ts` 放工具业务逻辑，避免把逻辑写死在 UI。
- `README.md` 说明输入输出、限制、依赖。

## 3. 模板契约（最低要求）

每个工具都必须导出以下结构：

```ts
export interface ToolManifest {
  id: string;
  module: "prompt" | "writing" | "code" | "docs" | "learning";
  name: string;
  summary: string;
  status: "已上线" | "开发中";
  tags?: string[];
}
```

并在 `manifest.ts` 中导出：

```ts
export const manifest: ToolManifest = { ... };
```

## 4. 给其他 agent 的开发提示词（可直接复用）

```txt
你正在为 Kongcheng Toolbox 开发一个新工具。请严格按以下约束生成代码：

1) 只在新目录 src/tools/<tool-id>/ 下创建文件，不修改现有业务文件。
2) 必须创建以下文件：manifest.ts, page.tsx, README.md。
3) manifest.ts 必须导出 `manifest` 常量，字段包含：
   id, module, name, summary, status, tags(可选)。
4) page.tsx 必须：
   - 使用 React + TypeScript。
   - 导出默认组件。
   - 包含输入区、结果区、加载态、错误态。
   - 不依赖后端时可用本地 mock 逻辑。
5) 业务逻辑与 UI 分离：复杂处理放在独立函数（可放 service.ts）。
6) 代码要可读、可维护：命名清晰，避免超长函数。
7) 页面布局必须使用统一外壳组件：`src/components/ui/tool-page-shell.tsx`。
8) 输出最终结果时给出：
   - 新增文件清单
   - 工具功能说明
   - 本地验证步骤（npm run lint / npx tsc --noEmit）
```

## 5. 并入主站的最小流程

1. 将工具文件夹放入 `src/tools/<tool-id>/`。
2. 运行 `npm run gen:tools` 生成 `src/lib/tool-registry.generated.ts`。
3. 首页与总览页会自动合并注册工具并展示。
4. 如需独立路由，在 `src/app/tools/<tool-id>/page.tsx` 接入该工具页面。

说明：

- `dev/build` 前会自动触发 `gen:tools`（通过 `predev/prebuild`）。
- 自动注册依赖每个工具目录下存在 `manifest.ts` 且导出 `manifest`。

## 6. 验收清单

- 工具目录结构完整。
- `manifest` 字段齐全、类型正确。
- 页面有输入、输出、加载、错误四态。
- 不污染全局状态。
- 通过 TypeScript 检查。
