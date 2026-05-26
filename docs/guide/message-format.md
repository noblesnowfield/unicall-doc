# 消息格式

Unicall 使用统一 `NotificationMessage` 描述消息内容。不同 Provider 会按自身能力选择最合适的格式。

## 文本

```ts
await runtime.send({
  title: '服务恢复',
  text: '订单服务已经恢复。'
});
```

所有已实现 Provider 都支持文本。喵提醒是纯文本渠道，会把 Markdown 或 HTML 降级为文本摘要。

## Markdown

```ts
await runtime.send({
  title: '部署完成',
  markdown: '## CI\n\n- 构建通过\n- 单元测试通过'
});
```

支持情况：

| Provider | 行为 |
| :--- | :--- |
| Webhook | 原样作为 JSON 字段发送 |
| Email | 作为纯文本正文发送，当前不会自动渲染为 HTML |
| Pushplus | 映射为 `template=markdown` |
| WxPusher | 映射为 `contentType=3` |
| 喵提醒 | 降级为文本摘要 |

## HTML

```ts
await runtime.send({
  title: '游戏事件',
  html: '<h1>副本匹配恢复正常</h1><p>服务已自动恢复。</p>'
});
```

支持情况：

| Provider | 行为 |
| :--- | :--- |
| Webhook | 原样作为 JSON 字段发送 |
| Email | 发送 HTML 邮件 |
| Pushplus | 映射为 `template=html` |
| WxPusher | 映射为 `contentType=2` |
| 喵提醒 | 降级为文本摘要 |

## 图片附件

邮件 Provider 支持附件和内联图片：

```ts
await runtime.send({
  title: '截图通知',
  html: '<p>查看截图：</p><img src="cid:demo-image">',
  attachments: [
    {
      name: 'demo.png',
      contentType: 'image/png',
      contentId: 'demo-image',
      data: screenshotBase64,
      encoding: 'base64'
    }
  ]
});
```

Webhook 会保留 `attachments` JSON 字段，由接收端决定如何处理。Pushplus、WxPusher、喵提醒当前不发送二进制附件；图片应使用可访问的远程 URL 放入 HTML 或文本内容中。

## 模板 demo

SDK 已提供模板 demo：

| 文件 | 用途 |
| :--- | :--- |
| `examples/templates/webhook-json.ts` | Webhook JSON 测试 |
| `examples/templates/email-html.ts` | HTML 邮件测试 |
| `examples/templates/email-game-notification.ts` | 游戏事件邮件模板 |
| `examples/templates/pushplus-markdown.ts` | Pushplus Markdown 测试 |
| `examples/templates/miaotixing-text.ts` | 喵提醒文本测试 |
| `examples/templates/wxpusher-html.ts` | WxPusher HTML 测试 |

通用游戏事件模板由 `createGameNotificationMessage()` 和 `createGameNotificationHtml()` 生成；邮件版本可使用 `createGameNotificationEmail()` 自动生成 HTML 正文和图片附件。

## 格式降级规则

当 Provider 支持多种格式时，当前优先级通常是：

```text
html -> markdown -> text
```

特殊规则：

- 喵提醒始终发送文本摘要。
- Email 有 `html` 时发送 HTML；否则发送 `text`，没有 `text` 时使用 `markdown` 作为纯文本。
- Webhook 不做降级，直接发送完整 `NotificationMessage` JSON。
- Pushplus 可通过 URL `template` 显式指定 `html`、`markdown` 或 `txt`。
