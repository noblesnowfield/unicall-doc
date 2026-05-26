# Webhook Provider

Webhook Provider 把完整 `NotificationMessage` 作为 JSON body 发送到目标服务，适合自有后端、内部系统和本地 mock。

## URL

```text
webhook://host/path?scheme=https&method=POST
```

示例：

```text
webhook://127.0.0.1:4317/mock/webhook?scheme=http&method=POST
webhook://api.example.com/notice?method=PATCH
```

## 参数

| 参数 | 必填 | 说明 |
| :--- | :--- | :--- |
| `host` | 是 | Webhook 接收端域名、IP 和可选端口。 |
| `path` | 是 | Webhook 接收端路径。 |
| `scheme` | 否 | 目标 HTTP 协议，默认 `https`；本地测试常用 `http`。 |
| `method` | 否 | 支持 `POST`、`PUT`、`PATCH`、`DELETE`，默认 `POST`。 |
| 其他 query | 否 | 原样透传到最终 HTTP URL。 |

## 消息映射

```json
{
  "title": "Unicall Webhook 测试",
  "text": "这是一条 Webhook JSON 测试消息。"
}
```

`text`、`markdown`、`html`、`attachments` 都会保留在 JSON 字段中，最终展示方式由接收端决定。

## 手动测试

先启动 SDK 本地测试页：

```bash
pnpm build
pnpm run push:ui
```

默认 mock 地址：

```text
webhook://127.0.0.1:4317/mock/webhook?scheme=http&method=POST
```

查看最近请求：

```text
http://127.0.0.1:4317/mock/webhook/requests
```

脚本：

```bash
pnpm exec tsx scripts/send/webhook.ts --profile default
```

脚本读取 `unicall.config.local.mjs`；不存在时回退 `unicall.config.example.mjs`。

## 限制

不要用 `webhook://example.com/...` 作为测试目标。`example.com` 是网页，不是 Webhook POST 接收服务，返回 HTML 时会被 Provider 识别为失败响应。
