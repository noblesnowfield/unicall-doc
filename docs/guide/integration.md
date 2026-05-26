# 接入方式

Unicall 的目标是同时服务 npm 包接入和浏览器构建产物接入。Node.js 服务端是推荐运行环境；浏览器只适合公开目标或后端代理场景。

## 包管理器安装

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

## Node.js ESM

```ts
import { createDefaultProviderRegistry, notify } from 'unicall';

await notify(
  'pushplus://PUSHPLUS_TOKEN?template=markdown',
  {
    title: '构建完成',
    markdown: '## CI\n\n构建已经通过。'
  },
  {
    registry: createDefaultProviderRegistry()
  }
);
```

## 直接下载构建产物

SDK 构建后会输出 `dist`。如果你不通过包管理器安装，可以下载发布包里的构建产物，再按运行环境引用：

```text
dist/index.js          Node / Bundler ESM
dist/index.cjs         CommonJS
dist/browser/index.js  Browser ESM
dist/browser/index.iife.js  Browser <script>
```

## 浏览器 ESM

```html
<script type="module">
  import { notify } from './dist/browser/index.js';

  await notify('webhook://api.example.com/public-notice', {
    title: '浏览器通知',
    text: '只发送到无敏感凭据的公开接口。'
  });
</script>
```

浏览器入口导出 Runtime、ProviderRegistry、中间件、解析器和错误类型，不默认导出需要服务端密钥的首批 Provider。

## 浏览器 `<script>`

```html
<script src="./dist/browser/index.iife.js"></script>
<script>
  const { notify } = window.Unicall;

  notify('webhook://api.example.com/public-notice', {
    title: '浏览器通知',
    text: '这类调用应经过你自己的后端代理。'
  });
</script>
```

如果你的构建产物使用了不同的全局变量名，请以实际发布包为准。

## 浏览器安全限制

不要在前端暴露这些敏感值：

- 企业微信、飞书、钉钉等企业协作机器人的签名密钥。
- SMTP 账号、授权码、密码。
- Pushplus token、WxPusher appToken、喵提醒喵码。
- 任何能直接代表服务端身份发送通知的凭据。

推荐方案是让浏览器请求你自己的后端接口，后端使用 `unicall` 读取 Secret 并发送通知。

```text
Browser -> 你的后端 /api/notify -> Unicall Runtime -> Provider
```

## JS 配置文件接入

测试和生产都推荐用 JS/TS 配置管理渠道结构、profile、模板和默认值，环境变量只承载真实敏感值。

```js
export default {
  defaultProfile: process.env.UNICALL_PROFILE ?? 'default',
  channels: {
    pushplus: {
      default: {
        token: process.env.UNICALL_PUSHPLUS_DEFAULT_TOKEN,
        template: 'markdown'
      }
    }
  }
};
```

真实环境变量使用统一命名：

```text
UNICALL_<CHANNEL>_<PROFILE>_<FIELD>
```

例如：

```text
UNICALL_PUSHPLUS_DEFAULT_TOKEN=
UNICALL_EMAIL_DEFAULT_PASS=
UNICALL_WXPUSHER_DEFAULT_APP_TOKEN=
```
