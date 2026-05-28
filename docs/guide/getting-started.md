# 快速开始

Unicall 是一个 URL 驱动的轻量通知运行时 SDK。实际使用时推荐把“渠道结构”写在 JS 配置文件里，把 token、SMTP 授权码、appToken 等真实敏感值放进 `.env.local` 或部署平台 Secret。

本页按本地开发最常见流程走一遍：安装 SDK、准备 `.env.local`、选择渠道 profile、选择消息模板，然后发送一条提醒。

## 安装

::: code-group

```bash [pnpm]
pnpm add @noblesnowfield/unicall
```

```bash [npm]
npm install @noblesnowfield/unicall
```

```bash [yarn]
yarn add @noblesnowfield/unicall
```

:::

## 本地配置文件

在 SDK 仓库中，先复制两个示例文件：

```bash
cp .env.example .env.local
cp unicall.config.example.mjs unicall.config.local.mjs
```

Windows PowerShell 可以使用：

```powershell
Copy-Item .env.example .env.local
Copy-Item unicall.config.example.mjs unicall.config.local.mjs
```

两个文件分工不同：

| 文件 | 是否提交 Git | 用途 |
| :--- | :--- | :--- |
| `.env.example` | 是 | 说明需要哪些环境变量。 |
| `.env.local` | 否 | 本地真实敏感值，例如 token、授权码、收件人。 |
| `unicall.config.example.mjs` | 是 | 展示渠道结构、profile 和模板结构。 |
| `unicall.config.local.mjs` | 否 | 本地真实渠道结构和自定义模板。 |

`.env.local` 只放真实值，不表达业务结构。结构放在 `unicall.config.local.mjs`，例如默认使用哪个 profile、Pushplus 使用什么模板、邮件使用哪个 HTML 模板。

## 配置 env 后才能发送提醒

以 Pushplus 为例，至少填写 token：

```dotenv
UNICALL_PROFILE=default
UNICALL_PUSHPLUS_DEFAULT_TOKEN=你的_pushplus_token
UNICALL_PUSHPLUS_DEFAULT_TOPIC=
UNICALL_PUSHPLUS_DEFAULT_TEMPLATE=markdown
```

以 Email / SMTP 为例，至少填写发信账号和收件人：

```dotenv
UNICALL_PROFILE=default
UNICALL_EMAIL_DEFAULT_SERVICE=qq
UNICALL_EMAIL_DEFAULT_USER=robot@qq.com
UNICALL_EMAIL_DEFAULT_PASS=你的_smtp_授权码
UNICALL_EMAIL_DEFAULT_FROM=robot@qq.com
UNICALL_EMAIL_DEFAULT_FROM_NAME=通知应用
UNICALL_EMAIL_DEFAULT_TO=admin@example.com
```

注意：QQ、163、Gmail 等邮箱通常需要“授权码”或“应用专用密码”，不是网页登录密码。

## 配置提醒内容

提醒内容推荐放在 `unicall.config.local.mjs` 的 `templates` 字段里。下面是一个邮件 HTML 模板示例：

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
          nickname: 'mzh',
          eventName: '服务提醒',
          eventTitle: '队列恢复正常',
          eventDescription: '匹配服务短暂抖动后已自动恢复。',
          screenshotUrl: 'https://example.com/status.png',
          actionUrl: 'https://example.com/dashboard',
          actionText: '查看详情'
        }
      }
    }
  }
};
```

如果你只想快速发送纯文本，可以把模板改成：

```js
templates: {
  email: {
    default: {
      messageType: 'text',
      title: 'Unicall 邮件测试',
      text: '这是一封本地测试邮件。'
    }
  }
}
```

HTML 模板的完整开发方式见 [HTML 模板](/guide/html-templates)。

## 发送一条提醒

在 SDK 仓库里可以用手动脚本验证真实渠道。脚本会读取 `.env.local` 和 `unicall.config.local.mjs`：

::: code-group

```bash [Pushplus]
pnpm exec tsx scripts/send/pushplus.ts --profile default
```

```bash [Email]
pnpm exec tsx scripts/send/email.ts --profile default
```

```bash [WxPusher]
pnpm exec tsx scripts/send/wxpusher.ts --profile default
```

```bash [Webhook]
pnpm exec tsx scripts/send/webhook.ts --profile default
```

:::

`--profile default` 会读取 `channels.<channel>.default` 和 `templates.<channel>.default`。如果不传 `--profile`，脚本会优先读取 `UNICALL_PROFILE`，再回退到配置文件里的 `defaultProfile`。

## 本地测试页

SDK 仓库提供本地页面测试工具，可以在浏览器里选择渠道、profile 和模板：

```bash
pnpm build
pnpm run push:ui
```

打开：

```text
http://127.0.0.1:4317
```

测试页会读取 `unicall.config.local.mjs` 和 `.env.local`；如果本地配置不存在，会回退到 `unicall.config.example.mjs`。修改源码、模板或配置示例后，需要重新 `pnpm build` 并重启 `pnpm run push:ui`。

WxPusher 扫码绑定在测试页里分为两种方式：

- 不搭服务器：点击 `开始扫码绑定`，页面会自动创建临时二维码、开始轮询扫码 UID，并把获取到的 UID 回填到 `uids`。
- 搭服务器：把 WxPusher 后台回调地址配置为公网 HTTPS 地址，测试页会自动监听 `/api/wxpusher/callbacks` 并回填 UID。

## 代码中发送

如果你已经有一个后端服务，也可以直接调用 SDK：

```ts
import { createDefaultProviderRegistry, notify } from '@noblesnowfield/unicall';

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

长期复用多个目标时，建议使用 `NotificationRuntime`：

```ts
import {
  NotificationRuntime,
  createDefaultProviderRegistry,
  retryMiddleware,
  timeoutMiddleware
} from '@noblesnowfield/unicall';

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

## 已实现 Provider

| Provider | 协议 | 适合场景 |
| :--- | :--- | :--- |
| Webhook | `webhook://` | 转发到自有服务、测试 mock、内部系统 |
| Email / SMTP | `smtp://`、`mailto://` | HTML 邮件、图片附件、运维通知 |
| 喵提醒 | `miaotixing://` | 个人轻量文本提醒 |
| Pushplus | `pushplus://` | 微信消息、Markdown/HTML 推送 |
| WxPusher | `wxpusher://` | 微信公众号应用推送、扫码拿 UID |

每个 Provider 都有独立文档页、mock 测试和手动发送脚本。
