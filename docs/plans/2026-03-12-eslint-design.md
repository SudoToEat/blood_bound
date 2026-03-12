# ESLint Design

**Date:** 2026-03-12

## Goal

为仓库补齐可运行的 ESLint 配置，覆盖前端 `src/**/*.ts(x)` 与 `server/index.js`，并让 `npm run lint` 在当前代码库上通过。

## Chosen Approach

采用 ESLint 8 传统配置方案：

- 新增 `.eslintrc.cjs`，使用现有依赖 `@typescript-eslint/parser`、`@typescript-eslint/eslint-plugin`、`eslint-plugin-react-hooks`、`eslint-plugin-react-refresh`。
- 新增 `.eslintignore`，排除 `dist/`、`node_modules/`、文档和静态产物。
- 更新 `package.json` 的 `lint` 脚本，将 `js,cjs,ts,tsx` 一并纳入，从而把 `server/index.js` 也纳入检查。

## Alternatives Considered

### Option A: ESLint 8 legacy config

与当前依赖、脚本和插件版本完全匹配，迁移风险最低。适合这次“补齐并跑通”的目标。

### Option B: ESLint flat config

更现代，但要同时调整配置格式、脚本和插件兼容方式，对当前仓库来说性价比低。

### Option C: 超宽松配置

最快，但很容易失去 lint 的约束价值，不适合作为长期基础。

## Design Details

### Base rules

- 默认规则以“发现真实问题”为主，不引入重型风格规则。
- 对 TypeScript 启用 `@typescript-eslint/no-unused-vars`，并关闭基础 `no-unused-vars`。
- 对 React 仅启用已有插件支持的 `react-hooks` 与 `react-refresh/only-export-components`。

### Server override

- 对 `server/**/*.js` 切到 Node 环境。
- 保持 parser 为默认 JS 解析，不要求将服务端迁移到 TypeScript。

### Ignore strategy

- 排除 `dist/`、`node_modules/`、`docs/`、图片和构建输出。
- 让 lint 聚焦源代码与服务器入口。

### Code cleanup

- 根据配置首次运行的结果，修正当前仓库中实际存在的 lint 违例。
- 优先修真实问题，再清无用变量与死代码。

## Verification Strategy

- `npm run lint`
- `npx tsc --noEmit --pretty false`
- `npm run build`
