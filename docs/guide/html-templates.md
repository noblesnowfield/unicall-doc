# HTML 模板

Unicall 的 HTML 模板不是一个单独的模板引擎，而是一种约定：模板函数最终返回 `NotificationMessage`，其中包含 `title`、`html`，必要时包含 `attachments`。Runtime 只负责把这个消息交给 Provider，Provider 再按自身能力发送或降级。

## 适用渠道

| Provider | HTML 行为 |
| :--- | :--- |
| Email / SMTP | 发送 HTML 邮件，可携带普通附件和 `cid:` 内联图片。 |
| Pushplus | 发送为 `template=html` 内容。 |
| WxPusher | 发送为 `contentType=2` 内容。 |
| Webhook | 原样把 `html` 字段放进 JSON body。 |
| 喵提醒 | 不支持 HTML，会提取文本摘要。 |

如果通知内容包含按钮、图片、状态卡片或运营类富文本，优先使用 HTML。纯文本告警、短信类渠道和喵提醒不适合承载复杂 HTML。

## 内置游戏事件模板

SDK 已内置两个模板函数：

```ts
import {
  createGameNotificationEmail,
  createGameNotificationMessage
} from 'unicall';
```

`createGameNotificationMessage()` 生成通用 HTML 消息，适合 Pushplus、WxPusher、Webhook：

```ts
const message = createGameNotificationMessage({
  appName: '通知应用',
  nickname: 'mzh',
  eventName: '服务提醒',
  eventTitle: '副本匹配队列恢复正常',
  eventDescription: '匹配服务短暂抖动后已自动恢复。',
  screenshotUrl: 'https://example.com/status.png',
  actionUrl: 'https://example.com/dashboard',
  actionText: '查看详情'
});
```

`createGameNotificationEmail()` 适合邮件，它可以把截图处理成邮件附件或内联图片：

```ts
const message = createGameNotificationEmail({
  appName: '通知应用',
  nickname: 'mzh',
  eventName: '服务提醒',
  eventTitle: '副本匹配队列恢复正常',
  eventDescription: '匹配服务短暂抖动后已自动恢复。',
  screenshotBase64,
  actionUrl: 'https://example.com/dashboard',
  actionText: '查看详情'
});
```

邮件里的图片可以用 `screenshotUrl` 引用远程图片，也可以用 `screenshotBase64` 生成内联附件。真实邮件建议优先用可控的 HTTPS 图片地址，避免邮件体过大。

## 在配置文件中选择模板

本地测试页和手动脚本会读取 `unicall.config.local.mjs` 的 `templates` 字段。推荐结构如下：

```js
export default {
  defaultProfile: process.env.UNICALL_PROFILE ?? 'default',
  templates: {
    email: {
      default: {
        messageType: 'html',
        template: 'gameNotification',
        templateOptions: {
          appName: '通知应用',
          nickname: 'mzh',
          eventName: '邮件提醒',
          eventTitle: '每日巡检完成',
          eventDescription: '所有核心接口均通过健康检查。',
          screenshotUrl: 'https://example.com/report.png',
          actionUrl: 'https://example.com/report',
          actionText: '查看报告'
        }
      }
    },
    pushplus: {
      ops: {
        messageType: 'html',
        template: 'gameNotification',
        templateOptions: {
          appName: '通知应用',
          eventName: '运维提醒',
          eventTitle: '发布完成',
          eventDescription: '生产环境版本已完成发布。',
          actionUrl: 'https://example.com/releases',
          actionText: '查看发布记录'
        }
      }
    },
    wxpusher: {
      default: {
        template: 'rawHtml',
        title: 'Unicall WxPusher 测试',
        html: '<h1>发布完成</h1><p>生产环境版本已完成发布。</p>'
      }
    }
  }
};
```

`profile` 决定读取哪份渠道配置，也决定优先读取哪份模板配置。例如 `--profile ops` 会优先使用 `templates.pushplus.ops`，没有时再回退到 `templates.pushplus.default` 或 demo 模板。

## 自定义 HTML 模板

最简单的自定义模板就是返回一段 HTML：

```ts
import type { NotificationMessage } from 'unicall';

interface DeployTemplateOptions {
  readonly appName: string;
  readonly version: string;
  readonly dashboardUrl: string;
}

export function createDeployHtmlTemplate(
  options: DeployTemplateOptions
): NotificationMessage {
  return {
    title: `${options.appName} 发布完成`,
    html: `
      <section style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>${escapeHtml(options.appName)} 发布完成</h1>
        <p>版本：<strong>${escapeHtml(options.version)}</strong></p>
        <p><a href="${escapeAttribute(options.dashboardUrl)}">查看发布详情</a></p>
      </section>
    `
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('`', '&#96;');
}
```

模板函数建议保持纯函数：只接收参数，只返回消息，不在函数里读取 env、发网络请求或调用 Provider。这样模板可以同时用于测试、本地脚本、后端服务和文档示例。

## 发送自定义模板

在业务代码里可以直接把模板结果传给 Runtime：

```ts
import { createDefaultProviderRegistry, notify } from 'unicall';
import { createDeployHtmlTemplate } from './templates/createDeployHtmlTemplate';

await notify(
  'pushplus://PUSHPLUS_TOKEN?template=html',
  createDeployHtmlTemplate({
    appName: '订单服务',
    version: '1.8.0',
    dashboardUrl: 'https://example.com/deployments/1.8.0'
  }),
  {
    registry: createDefaultProviderRegistry()
  }
);
```

邮件使用 HTML 与内联图片时，返回 `attachments`：

```ts
const message = {
  title: '巡检报告',
  html: '<h1>巡检完成</h1><p>截图如下：</p><img src="cid:report-image">',
  attachments: [
    {
      name: 'report.png',
      contentType: 'image/png',
      contentId: 'report-image',
      data: screenshotBase64,
      encoding: 'base64'
    }
  ]
};
```

## 本地测试页使用自定义 HTML

运行本地测试页：

```bash
pnpm build
pnpm run push:ui
```

打开 `http://127.0.0.1:4317` 后选择支持 HTML 的渠道，再把模板切换为“自定义 HTML”。测试页会读取 `templates.<channel>.<profile>` 的 `title` 和 `html` 字段：

```js
templates: {
  email: {
    default: {
      messageType: 'html',
      template: 'rawHtml',
      title: '自定义 HTML 邮件',
      html: '<h1>巡检完成</h1><p>所有核心服务正常。</p>'
    }
  }
}
```

当前手动发送脚本的能力略有差异：`wxpusher` 脚本支持 `gameNotification` 和原始 HTML；`email` 脚本主要用于 `gameNotification` 和文本模板；本地测试页覆盖更完整的原始 HTML 表单。

## HTML 编写建议

- 保持 HTML 自包含，少依赖外部 CSS。
- 邮件模板优先使用行内样式，因为很多邮箱客户端会过滤 `<style>`。
- 不要把 token、邮箱授权码或用户隐私字段拼进 HTML。
- 对用户输入做转义，避免把未可信内容直接插入 HTML。
- 图片体积要控制；邮件内联 base64 会增大邮件体，Pushplus 和 WxPusher 更适合使用 HTTPS 图片 URL。
- HTML 不应承载业务决策；真正的路由、重试和降级仍由 Runtime、Provider 和中间件处理。
