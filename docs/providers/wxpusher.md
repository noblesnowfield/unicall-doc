# WxPusher Provider

WxPusher Provider 用于微信公众号应用消息推送，支持文本、HTML 和 Markdown。

## URL

```text
wxpusher://APP_TOKEN?uids=UID_A,UID_B&topicIds=1,2
```

示例：

```text
wxpusher://AT_xxx?uids=UID_xxx
wxpusher://AT_xxx?topicIds=123
```

## 参数

| 参数 | 必填 | 说明 |
| :--- | :--- | :--- |
| `APP_TOKEN` | 是 | WxPusher 标准应用 appToken。 |
| `uids` / `uid` | 二选一 | 接收用户 UID 列表，多个用英文逗号分隔。 |
| `topicIds` / `topicId` | 二选一 | 主题 ID 列表，多个用英文逗号分隔。 |
| `url` | 否 | 消息点击跳转地址。 |
| `verifyPayType` | 否 | WxPusher 付费校验参数。 |
| `endpoint` | 否 | 自定义发送接口，主要用于测试或代理。 |

至少需要 `uids` 或 `topicIds` 其中一个。

## 环境变量

```text
UNICALL_WXPUSHER_DEFAULT_APP_TOKEN=
UNICALL_WXPUSHER_DEFAULT_UIDS=
UNICALL_WXPUSHER_DEFAULT_TOPIC_IDS=
UNICALL_WXPUSHER_DEFAULT_APP_QR_CODE_URL=
UNICALL_WXPUSHER_DEFAULT_QR_CODE_URL=
UNICALL_WXPUSHER_DEFAULT_SUBSCRIBE_URL=
UNICALL_WXPUSHER_DEFAULT_CALLBACK_URL=
UNICALL_WXPUSHER_DEFAULT_QR_EXTRA=unicall-local-test
UNICALL_WXPUSHER_DEFAULT_QR_VALID_TIME=1800
```

## 消息映射

Provider 优先选择 `html`，其次 `markdown`，最后 `text`。

| 消息格式 | WxPusher `contentType` |
| :--- | :--- |
| `text` | `1` |
| `html` | `2` |
| `markdown` | `3` |

```ts
await runtime.send({
  title: 'Unicall WxPusher 测试',
  html: '<h1>Unicall</h1><p>这是一条 HTML 测试消息。</p>'
});
```

## 扫码拿 UID

SDK 提供辅助方法：

- `createWxPusherQrCode()`：创建参数二维码。
- `queryWxPusherQrCodeUid()`：根据二维码 code 查询扫码 UID。
- `parseWxPusherCallback()`：解析 WxPusher 后台回调事件。

本地测试页可以展示应用二维码、生成参数二维码、查询 UID，并接收回调。WxPusher 后台回调地址必须是公网可访问地址；本地联调可用内网穿透转发到：

```text
http://127.0.0.1:4317/api/wxpusher/callback
```

## 手动测试

```bash
pnpm exec tsx scripts/send/wxpusher.ts --profile default
```

脚本读取 `channels.wxpusher.<profile>` 和 `templates.wxpusher.<profile>`。

## 限制

- 当前实现是标准应用推送，不是极简 SPT 模式。
- 当前版本不发送二进制附件；图片建议放在 HTML 内容中使用远程 URL。
- 不要把 appToken 写进浏览器代码或公开构建产物。
