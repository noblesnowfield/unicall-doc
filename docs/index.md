---
layout: home

hero:
  name: Unicall
  text: URL 驱动的轻量通知运行时
  tagline: 面向 Node.js / TypeScript 的 Provider 插件、中间件管线和统一消息模型。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: Provider 文档
      link: /providers/webhook
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/noblesnowfield/unicall.git

features:
  - title: URL 驱动
    details: 用 webhook://、smtp://、pushplus:// 等 URL 描述通知目标，配置可以落在 JS 文件、环境变量或部署平台 Secret 中。
  - title: Runtime-first
    details: Runtime 只负责编排解析、Provider、Middleware 和错误结果，渠道逻辑保持插件化。
  - title: China-friendly Provider
    details: 首批覆盖 Webhook、Email、喵提醒、Pushplus、WxPusher，并为每个渠道保留 mock 测试和手动推送脚本。
  - title: HTML 模板
    details: 支持邮件、Pushplus、WxPusher 等 HTML 消息，文档提供 env、本地配置、自定义模板和测试页使用方式。
---

## 安装

```bash
pnpm add @noblesnowfield/unicall
```

## 快速发送

```ts
import { createDefaultProviderRegistry, notify } from '@noblesnowfield/unicall';

await notify(
  'webhook://127.0.0.1:4317/mock/webhook?scheme=http&method=POST',
  {
    title: 'Unicall 测试',
    text: '这是一条本地 Webhook 通知。'
  },
  {
    registry: createDefaultProviderRegistry()
  }
);
```

## 安全边界

浏览器直连只适合无敏感凭据的公开接口或你自己的后端代理。不要把企业微信、飞书、钉钉、SMTP、WxPusher、Pushplus 等服务端密钥暴露在前端代码、HTML 或公开构建产物中。

## 下一步

- [快速开始](/guide/getting-started)：从 `.env.local` 配置到发送第一条提醒。
- [HTML 模板](/guide/html-templates)：开发、配置和测试自定义 HTML 通知。
- [GitHub 仓库](https://github.com/noblesnowfield/unicall.git)：查看源码、提交 Issue 或参与贡献。
