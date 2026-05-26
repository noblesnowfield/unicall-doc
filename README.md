# unicall-doc

Unicall 文档站，基于 VitePress，用于维护 Unicall 的使用说明、设计思路、API、消息格式、HTML 模板、Provider 和测试贡献文档。

GitHub 仓库：[noblesnowfield/unicall.git](https://github.com/noblesnowfield/unicall.git)

## 文档范围

当前文档站覆盖：

- 快速开始：安装、`.env.local`、`unicall.config.local.mjs`、profile 和发送第一条提醒。
- 接入方式：Node.js、npm / pnpm / yarn、浏览器 ESM、浏览器 `<script>` 和安全边界。
- 核心概念：URL 驱动、Runtime、Provider、中间件和错误系统。
- API 文档：`NotificationRuntime`、`notify` 和公共类型。
- 消息格式：text、Markdown、HTML、图片附件、模板 demo 和格式降级规则。
- HTML 模板：内置模板、自定义模板、本地测试页和邮件内联图片。
- Provider 文档：Webhook、Email / SMTP、喵提醒、Pushplus、WxPusher。
- 测试与贡献：新增 Provider、mock 测试、真实推送脚本和配置规范。

Provider 示例应与 `unicall` SDK 的测试脚本、配置示例和模板 demo 保持一致。

## 本地开发

安装依赖：

```bash
pnpm install
```

启动开发服务：

```bash
pnpm docs:dev
```

默认访问：

```text
http://127.0.0.1:5173
```

## 构建

```bash
pnpm docs:build
```

本地预览构建产物：

```bash
pnpm docs:preview
```

## 与主项目同步

当 `unicall` 主项目发生这些变化时，需要同步检查文档站：

- 新增或修改 Provider。
- 修改 URL 参数、环境变量或配置文件结构。
- 修改 `NotificationMessage`、`SendResult`、错误类型等公共类型。
- 修改 HTML 模板、附件、格式降级规则。
- 修改手动推送脚本或本地测试页行为。
- 新增浏览器构建产物或调整安全边界说明。

文档站只提交可公开内容，不写入真实 token、SMTP 授权码、appToken 或本地 `.env.local`。
