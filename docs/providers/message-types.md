# 渠道消息类型支持

不同通知渠道对 `NotificationMessage` 的字段支持并不完全一致。Unicall 会尽量按渠道能力选择最合适的内容字段，但“原生支持”和“降级发送”需要区分：

- 原生支持：Provider 会把该字段映射为目标平台对应的消息类型。
- 降级发送：Provider 不支持该富文本类型，但会提取可读文本继续发送。
- 透传字段：Webhook 只负责传递完整 JSON，最终展示由接收端决定。

## 支持矩阵

| Provider | 文本 `text` | Markdown `markdown` | HTML `html` | 附件 / 图片 | 说明 |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Webhook | 支持 | 透传 | 透传 | 透传 | 完整发送 `NotificationMessage` JSON，接收端自行渲染。 |
| Email / SMTP | 支持 | 支持 | 支持 | 支持 | Markdown 当前作为纯文本正文；HTML 可配合内联图片和 MIME 附件。 |
| 喵提醒 | 支持 | 降级 | 降级 | 不支持 | 纯文本渠道，Markdown / HTML 会提取文本摘要。 |
| Pushplus | 支持 | 支持 | 支持 | 不支持 | 通过 `template=txt`、`template=markdown`、`template=html` 发送；图片建议使用远程 URL。 |
| WxPusher | 支持 | 支持 | 支持 | 不支持 | 分别映射到 `contentType=1`、`3`、`2`；图片建议放在 HTML 远程 URL 中。 |

## 推荐选择

| 场景 | 推荐格式 | 推荐渠道 |
| :--- | :--- | :--- |
| 简短告警、个人提醒 | `text` | 喵提醒、Pushplus、WxPusher、Email |
| 运维日报、构建结果、列表内容 | `markdown` | Pushplus、WxPusher、Webhook |
| 状态卡片、按钮、富文本通知 | `html` | Email、Pushplus、WxPusher |
| 截图、报告、图片内联 | `html` + `attachments` | Email |
| 自有系统二次处理 | 完整 `NotificationMessage` JSON | Webhook |

## 降级规则

当消息同时包含多个内容字段时，多数富文本渠道会按下面顺序选择：

```text
html -> markdown -> text
```

特殊规则：

- Webhook 不做选择和降级，直接透传完整 JSON。
- Email 有 `html` 时发送 HTML；没有 `html` 时发送 `text`，再退回 `markdown` 纯文本。
- 喵提醒始终发送文本摘要，不原生渲染 Markdown 或 HTML。
- Pushplus 如果在 URL 或配置里指定了 `template`，会优先使用指定模板；内容字段仍会按可用性降级。
- WxPusher 会根据最终选中的内容字段映射 `contentType`。

更完整的字段示例见 [消息格式](/guide/message-format)，各渠道配置方式见对应 Provider 页面。
