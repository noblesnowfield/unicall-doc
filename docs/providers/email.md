# Email / SMTP Provider

Email Provider 支持 `smtp://` 和 `mailto://` 两个协议形态，当前用于 SMTP 发信、HTML 邮件、图片附件和内联图片。

## URL

```text
smtp://user:pass@host:port?from=sender@example.com&to=a@example.com,b@example.com&secure=true
mailto://user:pass@host:port?from=sender@example.com&to=a@example.com
```

示例：

```text
smtp://robot:AUTH_CODE@qq?service=qq&from=robot@qq.com&to=admin@example.com&secure=true
smtp://robot:AUTH_CODE@smtp.qq.com:465?from=robot@qq.com&to=a@example.com,b@example.com&fromName=通知应用
```

## 参数

| 参数 | 必填 | 说明 |
| :--- | :--- | :--- |
| `user` | 是 | SMTP 登录账号，通常是完整邮箱地址。 |
| `pass` | 是 | SMTP 授权码或应用专用密码。 |
| `host` | 是 | SMTP host，也可以填 `qq`、`foxmail`、`163`、`gmail`、`outlook`、`hotmail` 作为 service。 |
| `port` | 否 | SMTP 端口；不填时按 service 和 secure 推断。 |
| `service` | 否 | 邮箱服务预设；显式 host、port 优先。 |
| `secure` | 否 | 是否 SSL 直连。`true` 常用 465，`false` 常用 STARTTLS 587。 |
| `startTls` | 否 | 是否启用 STARTTLS。 |
| `from` | 是 | 发件邮箱。 |
| `fromName` | 否 | 发件人昵称。 |
| `to` | 是 | 收件人列表，多个用英文逗号分隔。 |

## 环境变量

```text
UNICALL_EMAIL_DEFAULT_SERVICE=
UNICALL_EMAIL_DEFAULT_HOST=
UNICALL_EMAIL_DEFAULT_PORT=
UNICALL_EMAIL_DEFAULT_SECURE=
UNICALL_EMAIL_DEFAULT_USER=
UNICALL_EMAIL_DEFAULT_PASS=
UNICALL_EMAIL_DEFAULT_FROM=
UNICALL_EMAIL_DEFAULT_FROM_NAME=
UNICALL_EMAIL_DEFAULT_TO=
```

`PASS` 应填写授权码或应用专用密码，不要提交到 Git。

## 消息映射

- `text` 发送纯文本邮件。
- `html` 发送 HTML 邮件。
- `markdown` 在当前版本作为纯文本正文发送。
- `attachments` 组装为 MIME 附件。
- `contentId` 会生成内联图片，可在 HTML 中用 `cid:<contentId>` 引用。

## HTML 与图片附件

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

SDK 也提供 `createGameNotificationEmail()`，用于生成游戏事件类 HTML 邮件和截图附件。

如果你想自己写 HTML，可以直接传 `html` 字段：

```ts
await runtime.send({
  title: '巡检完成',
  html: `
    <section style="font-family: Arial, sans-serif;">
      <h1>巡检完成</h1>
      <p>所有核心服务均通过健康检查。</p>
    </section>
  `
});
```

邮件客户端对 CSS 支持不一致，建议使用行内样式，避免依赖复杂选择器、脚本或外部样式表。

## 配置文件模板

本地 `.env.local` 负责 SMTP 真实值：

```dotenv
UNICALL_EMAIL_DEFAULT_SERVICE=qq
UNICALL_EMAIL_DEFAULT_USER=robot@qq.com
UNICALL_EMAIL_DEFAULT_PASS=你的_smtp_授权码
UNICALL_EMAIL_DEFAULT_FROM=robot@qq.com
UNICALL_EMAIL_DEFAULT_FROM_NAME=通知应用
UNICALL_EMAIL_DEFAULT_TO=admin@example.com
```

`unicall.config.local.mjs` 负责选择 HTML 模板：

```js
export default {
  defaultProfile: process.env.UNICALL_PROFILE ?? 'default',
  channels: {
    email: {
      default: {
        service: process.env.UNICALL_EMAIL_DEFAULT_SERVICE || 'qq',
        user: process.env.UNICALL_EMAIL_DEFAULT_USER,
        pass: process.env.UNICALL_EMAIL_DEFAULT_PASS,
        from: process.env.UNICALL_EMAIL_DEFAULT_FROM,
        fromName: process.env.UNICALL_EMAIL_DEFAULT_FROM_NAME ?? '通知应用',
        to: process.env.UNICALL_EMAIL_DEFAULT_TO?.split(',') ?? []
      }
    }
  },
  templates: {
    email: {
      default: {
        messageType: 'html',
        template: 'gameNotification',
        templateOptions: {
          appName: '通知应用',
          eventName: '邮件提醒',
          eventTitle: '每日巡检完成',
          eventDescription: '所有核心接口均通过健康检查。',
          actionUrl: 'https://example.com/report',
          actionText: '查看报告'
        }
      }
    }
  }
};
```

## 手动测试

```bash
pnpm exec tsx scripts/send/email.ts --profile default
```

脚本读取：

- 渠道配置：`channels.email.<profile>`
- 内容配置：`templates.email.<profile>`、`templates.email.default` 或 `templates.email.gameNotification`

本地测试页还支持“自定义 HTML”表单，可直接编辑 `title` 和 `html` 字段验证邮件渲染。更完整的模板说明见 [HTML 模板](/guide/html-templates)。

## 限制

当前版本不引入 `nodemailer`，内置 SMTP 客户端覆盖常见 AUTH PLAIN、TLS/STARTTLS、HTML 和附件场景。不同邮箱服务的策略差异较大，真实发信前建议先用测试账号验证。
