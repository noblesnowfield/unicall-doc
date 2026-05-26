# Pushplus Provider

Pushplus Provider 用于微信消息推送，支持文本、Markdown 和 HTML 内容。

## URL

```text
pushplus://TOKEN?topic=GROUP&template=markdown
```

示例：

```text
pushplus://PUSHPLUS_TOKEN?topic=ops&template=html
```

## 参数

| 参数 | 必填 | 说明 |
| :--- | :--- | :--- |
| `TOKEN` | 是 | Pushplus 用户 token。 |
| `topic` | 否 | 群组编码，不填则发给 token 默认接收人。 |
| `template` | 否 | 支持 `html`、`markdown`、`txt`。 |
| `channel` | 否 | Pushplus 渠道参数。 |
| `webhook` | 否 | Pushplus webhook 参数。 |
| `callbackUrl` | 否 | Pushplus 回调地址。 |
| `endpoint` | 否 | 自定义发送接口，主要用于测试或代理。 |

## 环境变量

```text
UNICALL_PUSHPLUS_DEFAULT_TOKEN=
UNICALL_PUSHPLUS_DEFAULT_TOPIC=
UNICALL_PUSHPLUS_DEFAULT_TEMPLATE=markdown
UNICALL_PUSHPLUS_OPS_TOKEN=
UNICALL_PUSHPLUS_OPS_TOPIC=
UNICALL_PUSHPLUS_OPS_TEMPLATE=html
```

## 消息映射

Provider 优先选择 `html`，其次 `markdown`，最后 `text`。如果 URL 显式指定 `template`，会使用指定模板。

```ts
await runtime.send({
  title: 'Unicall Pushplus 测试',
  markdown: '## Unicall\n\n这是一条 Markdown 测试消息。'
});
```

发送体核心字段：

```json
{
  "token": "PUSHPLUS_TOKEN",
  "title": "Unicall Pushplus 测试",
  "content": "## Unicall\n\n这是一条 Markdown 测试消息。",
  "template": "markdown"
}
```

HTML 发送示例：

```ts
await runtime.send({
  title: 'Unicall Pushplus HTML 测试',
  html: '<h1>发布完成</h1><p>生产环境版本已经发布。</p>'
});
```

如果 URL 使用 `template=html`，请确保消息里传入 `html`，否则 Provider 会按可用字段降级。

## 配置文件模板

`.env.local` 中填写真实 token：

```dotenv
UNICALL_PUSHPLUS_DEFAULT_TOKEN=你的_pushplus_token
UNICALL_PUSHPLUS_DEFAULT_TOPIC=
UNICALL_PUSHPLUS_DEFAULT_TEMPLATE=html
```

`unicall.config.local.mjs` 中可以为 Pushplus 配置 HTML 模板：

```js
export default {
  defaultProfile: process.env.UNICALL_PROFILE ?? 'default',
  channels: {
    pushplus: {
      default: {
        token: process.env.UNICALL_PUSHPLUS_DEFAULT_TOKEN,
        topic: process.env.UNICALL_PUSHPLUS_DEFAULT_TOPIC,
        template: process.env.UNICALL_PUSHPLUS_DEFAULT_TEMPLATE ?? 'html'
      }
    }
  },
  templates: {
    pushplus: {
      default: {
        messageType: 'html',
        template: 'gameNotification',
        templateOptions: {
          appName: '通知应用',
          eventName: 'Pushplus 提醒',
          eventTitle: '发布完成',
          eventDescription: '生产环境版本已经发布。',
          actionUrl: 'https://example.com/releases',
          actionText: '查看发布记录'
        }
      }
    }
  }
};
```

HTML 模板的开发方式见 [HTML 模板](/guide/html-templates)。

## 手动测试

```bash
pnpm exec tsx scripts/send/pushplus.ts --profile default
```

脚本读取 `channels.pushplus.<profile>`，并使用 `examples/templates/pushplus-markdown.ts`。如果要在页面里切换 `gameNotification` 或自定义 HTML 模板，请使用本地测试页 `pnpm run push:ui`。

## 错误与限制

- HTTP 非 2xx 会转成结构化 Provider 错误。
- Pushplus 响应 `code !== 200` 会转成 `ProviderSendError`。
- `code === 429` 或服务端错误码会标记为可重试。
- 当前版本不发送二进制附件。
