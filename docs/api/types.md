# 类型定义

## `NotificationMessage`

统一消息模型。

```ts
interface NotificationMessage {
  readonly title?: string;
  readonly text?: string;
  readonly markdown?: string;
  readonly html?: string;
  readonly attachments?: readonly NotificationAttachment[];
  readonly priority?: number;
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly dedupeKey?: string;
}
```

至少需要提供 `text`、`markdown`、`html` 或 `attachments` 之一。

## `NotificationAttachment`

```ts
interface NotificationAttachment {
  readonly name?: string;
  readonly contentType?: string;
  readonly url?: string;
  readonly data?: string | ArrayBuffer | Uint8Array;
  readonly encoding?: 'base64' | 'utf8';
  readonly contentId?: string;
}
```

邮件 Provider 会把 `contentId` 映射为内联附件 `Content-ID`。Webhook 会保留附件字段作为 JSON。

## `NotificationProvider`

```ts
interface NotificationProvider {
  readonly name: string;
  readonly protocol: string;
  readonly capabilities: ProviderCapabilities;
  send(
    message: NotificationMessage,
    context: NotificationSendContext
  ): Promise<SendResult>;
}
```

Provider 应保持独立可测试，不直接依赖其他 Provider。

## `ProviderFactory`

```ts
interface ProviderFactory {
  readonly protocol: string;
  create(url: NotificationUrl): NotificationProvider;
}
```

Factory 负责把已解析的 URL 转为 Provider 实例。

## `ProviderCapabilities`

```ts
interface ProviderCapabilities {
  readonly text?: boolean;
  readonly markdown?: boolean;
  readonly html?: boolean;
  readonly attachments?: boolean;
  readonly images?: boolean;
  readonly templates?: boolean;
}
```

能力声明用于文档、调试和后续自动降级策略。

## `SendResult`

```ts
interface SendResult {
  readonly provider: string;
  readonly protocol: string;
  readonly success: boolean;
  readonly statusCode?: number;
  readonly latencyMs?: number;
  readonly retryable?: boolean;
  readonly error?: NotificationError;
  readonly raw?: unknown;
}
```

`raw` 保留渠道响应原始内容，调用方不应依赖它作为稳定公共协议。

## `NotificationUrl`

`parseNotificationUrl()` 会返回结构化 URL：

```ts
import { parseNotificationUrl } from 'unicall';

const parsed = parseNotificationUrl(
  'pushplus://TOKEN?topic=ops&template=markdown'
);

console.log(parsed.protocol);
console.log(parsed.query.get('template'));
```

Provider 内部优先使用 `query`、`queryAll`、`host`、`pathname` 等结构化字段，不直接做脆弱字符串截取。

## 错误类型

```ts
import {
  AuthenticationError,
  InvalidProviderConfigError,
  NotificationError,
  ProviderSendError,
  RateLimitError,
  TimeoutError
} from 'unicall';
```

所有 Provider 错误都应继承 `NotificationError`。`retryable` 需要明确标记，不能依赖调用方猜测。
