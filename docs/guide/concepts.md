# 核心概念

## URL 驱动

Unicall 用 URL 描述通知目标。协议名选择 Provider，authority 和 query 传递渠道配置。

```text
pushplus://TOKEN?topic=ops&template=markdown
webhook://127.0.0.1:4317/mock/webhook?scheme=http&method=POST
smtp://user:pass@smtp.qq.com:465?from=robot@qq.com&to=admin@example.com&secure=true
```

URL 不等于必须把真实密钥写进代码。生产环境应由 JS 配置文件和环境变量组合 URL，日志中只输出脱敏值。

## Runtime

`NotificationRuntime` 是发送流程的编排核心：

1. 解析通知 URL。
2. 从 `ProviderRegistry` 创建 Provider。
3. 组装中间件管线。
4. 调用 Provider 发送消息。
5. 返回结构化 `SendResult[]`。

Runtime 不硬编码任何渠道逻辑。

## Provider

Provider 是渠道插件。每个 Provider 只负责自己的配置解析、消息格式映射、网络请求和错误归一化。

已实现 Provider：

- `webhook://`
- `smtp://` / `mailto://`
- `miaotixing://`
- `pushplus://`
- `wxpusher://`

新增 Provider 时应实现共享接口，并注册到 `ProviderRegistry` 或自定义 Registry。

## 中间件

中间件是发送链路的一等能力，适合处理横切关注点：

- logging
- retry
- timeout
- metrics
- dedupe
- rate limiting

当前 SDK 已提供：

```ts
import {
  loggingMiddleware,
  retryMiddleware,
  timeoutMiddleware
} from 'unicall';
```

中间件围绕 `MiddlewareContext` 和 `next()` 组合，可以在 Provider 调用前后读写 `state`、统计耗时或处理错误。

## 错误系统

所有 Provider 错误都应归一到 `NotificationError` 子类。

常用错误：

| 错误 | 含义 |
| :--- | :--- |
| `InvalidUrlError` | 通知 URL 格式非法 |
| `ProviderNotFoundError` | Registry 中没有对应协议 |
| `InvalidProviderConfigError` | Provider 参数缺失或不合法 |
| `InvalidMessageError` | 消息没有可发送内容 |
| `ProviderSendError` | Provider 调用失败 |
| `RateLimitError` | 渠道限流 |
| `TimeoutError` | 发送超时 |
| `AuthenticationError` | 鉴权失败 |

`SendResult` 会保留 `success`、`retryable`、`statusCode`、`latencyMs` 和 `error`，方便上层做日志、指标和告警。
