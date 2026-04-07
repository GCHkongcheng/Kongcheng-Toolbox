# 空城工具箱

空城工具箱是一个面向创作与开发场景的工具聚合站点，提供工具总览、网址导航、Markdown 在线预览等能力。

线上预览：<https://gchkc.top>

## 项目特色

- 工具总览：按模块展示当前可用工具与 Demo。
- 网址导航：聚合常用开发、学习与效率站点，并支持收藏。
- Markdown 预览：提供实时编辑与渲染，适合文档草稿和格式校对。
- 关于页面：介绍项目定位、设计原则与后续方向。

## 本地运行

先安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

浏览器打开：<http://localhost:3000>

## 常用脚本

- `npm run dev`：启动开发环境，同时生成工具注册表。
- `npm run build`：生成生产构建，同时生成工具注册表。
- `npm start`：启动生产服务。
- `npm run lint`：执行代码检查。
- `npm run gen:tools`：手动生成工具注册表。

## 目录概览

- `src/app`：页面与路由。
- `src/components`：通用 UI 组件。
- `src/lib`：业务数据与工具函数。
- `src/tools`：各工具模块实现。
- `templates`：新工具模板。

## 部署说明

该项目可直接部署为 Next.js 应用。生产环境建议先执行 `npm run build`，再使用 `npm start` 验证构建结果。
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
