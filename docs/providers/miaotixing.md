# 喵提醒 Provider

喵提醒 Provider 面向个人轻量文本通知。它会把统一消息降级为文本摘要，再通过喵提醒触发器发送。

## URL

```text
miaotixing://MIAO_ID?type=json&app=APP_ID&option=nosms
```

示例：

```text
miaotixing://t0e1q9G?type=json
```

## 参数

| 参数 | 必填 | 说明 |
| :--- | :--- | :--- |
| `MIAO_ID` | 是 | 个人喵码。简易文本推送只需要这个字段。 |
| `type` | 否 | 响应类型，支持 `json`、`jsonp`、`plain`，默认 `json`。 |
| `app` | 否 | 开发者应用 id。 |
| `option` | 否 | 高级选项，例如 `nosms`。 |
| `templ` | 否 | 喵提醒模板参数。 |
| `callback` | 否 | 喵提醒回调参数。 |
| `endpoint` | 否 | 自定义接口地址，主要用于测试或代理。 |

## 环境变量

```text
UNICALL_MIAOTIXING_DEFAULT_ID=
UNICALL_MIAOTIXING_DEFAULT_APP=
UNICALL_MIAOTIXING_DEFAULT_TYPE=
UNICALL_MIAOTIXING_DEFAULT_OPTION=
```

## 消息映射

喵提醒只发送文本：

```ts
await runtime.send({
  title: '喵提醒测试',
  text: '这是一条文本提醒。'
});
```

如果传入 Markdown 或 HTML，Provider 会提取纯文本摘要作为 `text` 参数。

## 手动测试

```bash
pnpm exec tsx scripts/send/miaotixing.ts --profile default
```

脚本读取 `channels.miaotixing.<profile>`，并使用 `examples/templates/miaotixing-text.ts` 作为 demo 内容。

## 错误与限制

- 喵提醒返回 `102` 或 `109` 时会映射为 `RateLimitError`。
- 当前 Provider 不支持 Markdown、HTML、附件或图片。
- 不要把喵码写进前端页面或公开仓库。
