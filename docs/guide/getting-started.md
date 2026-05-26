# 快速开始

Unicall 是一个 URL 驱动的轻量通知运行时 SDK。它不是简单 webhook 包装器，而是把 Runtime、Provider、中间件、统一消息模型和结构化错误组合成一个可扩展通知运行时。

## 安装

::: code-group

```bash [pnpm]
pnpm add unicall
```

```bash [npm]
npm install unicall
```

```bash [yarn]
yarn add unicall
```

:::

## 最小示例

```ts
import { createDefaultProviderRegistry, notify } from 'unicall';

const results = await notify(
  'webhook://127.0.0.1:4317/mock/webhook?scheme=http&method=POST',
  {
    title: 'Unicall 测试',
    text: '这是一条文本通知。'
  },
  {
    registry: createDefaultProviderRegistry()
  }
);

console.log(results[0]?.success);
```

## Runtime 示例

当你要复用多个目标、注入中间件或长期持有配置时，建议直接使用 `NotificationRuntime`。

```ts
import {
  NotificationRuntime,
  createDefaultProviderRegistry,
  retryMiddleware,
  timeoutMiddleware
} from 'unicall';

const runtime = new NotificationRuntime({
  registry: createDefaultProviderRegistry(),
  middleware: [
    timeoutMiddleware({ timeoutMs: 5000 }),
    retryMiddleware({ retries: 2 })
  ]
});

runtime.add([
  'webhook://127.0.0.1:4317/mock/webhook?scheme=http&method=POST',
  'pushplus://PUSHPLUS_TOKEN?template=markdown'
]);

const results = await runtime.send({
  title: '部署完成',
  markdown: '## Unicall\n\n生产环境部署完成。'
});
```

## 本地验证

SDK 仓库提供本地页面测试工具：

```bash
pnpm build
pnpm run push:ui
```

打开：

```text
http://127.0.0.1:4317
```

页面会读取 `unicall.config.local.mjs` 和 `.env.local`；如果本地配置不存在，会回退到 `unicall.config.example.mjs`。真实 token、SMTP 授权码、appToken 等敏感值只应放在本地或部署平台 Secret 中。

## 已实现 Provider

| Provider | 协议 | 适合场景 |
| :--- | :--- | :--- |
| Webhook | `webhook://` | 转发到自有服务、测试 mock、内部系统 |
| Email / SMTP | `smtp://`、`mailto://` | HTML 邮件、图片附件、运维通知 |
| 喵提醒 | `miaotixing://` | 个人轻量文本提醒 |
| Pushplus | `pushplus://` | 微信消息、Markdown/HTML 推送 |
| WxPusher | `wxpusher://` | 微信公众号应用推送、扫码拿 UID |

每个 Provider 都有独立文档页、mock 测试和手动发送脚本。
