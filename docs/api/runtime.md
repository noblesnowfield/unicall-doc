# Runtime 与 notify

## `NotificationRuntime`

`NotificationRuntime` 适合需要复用多个通知目标、注入中间件或长期持有 Registry 的场景。

```ts
import {
  NotificationRuntime,
  createDefaultProviderRegistry
} from 'unicall';

const runtime = new NotificationRuntime({
  registry: createDefaultProviderRegistry()
});

runtime.add('webhook://127.0.0.1:4317/mock/webhook?scheme=http&method=POST');

const results = await runtime.send({
  title: 'Unicall',
  text: '发送成功'
});
```

### 构造参数

```ts
new NotificationRuntime(options?: NotificationRuntimeOptions)
```

| 参数 | 类型 | 说明 |
| :--- | :--- | :--- |
| `registry` | `ProviderRegistry` | 可选，自定义 Provider 注册表；不传时创建空注册表。 |
| `middleware` | `NotificationMiddleware[]` | 可选，Runtime 默认中间件。 |

如果要使用内置 Provider，需要传入 `createDefaultProviderRegistry()`。

### `add()`

```ts
runtime.add(url: string | readonly string[]): this
```

解析一个或多个通知 URL，创建对应 Provider，并加入当前 Runtime。

### `providers()`

```ts
runtime.providers(): readonly NotificationProvider[]
```

返回已添加的 Provider 实例，常用于调试或验证目标数量。

### `use()`

```ts
runtime.use(middleware: NotificationMiddleware): this
```

追加 Runtime 级中间件。

### `send()`

```ts
runtime.send(
  message: NotificationMessage,
  options?: {
    signal?: AbortSignal;
    middleware?: readonly NotificationMiddleware[];
  }
): Promise<SendResult[]>
```

发送统一消息到所有已添加目标。调用级 `middleware` 会追加到 Runtime 级中间件之后。

`send()` 会校验消息至少包含 `text`、`markdown`、`html` 或 `attachments` 之一；否则抛出 `InvalidMessageError`。

## `notify()`

`notify()` 是一次性发送的便捷函数。

```ts
import { createDefaultProviderRegistry, notify } from 'unicall';

await notify(
  'pushplus://PUSHPLUS_TOKEN?template=markdown',
  {
    title: 'CI 完成',
    markdown: '## 构建通过'
  },
  {
    registry: createDefaultProviderRegistry()
  }
);
```

签名：

```ts
function notify(
  url: string | readonly string[],
  message: NotificationMessage,
  options?: NotifyOptions
): Promise<SendResult[]>
```

`notify()` 内部会创建一个新的 `NotificationRuntime`，添加目标 URL，然后调用 `send()`。

## 默认 Provider Registry

```ts
import { createDefaultProviderRegistry } from 'unicall';
```

默认注册：

- `webhook://`
- `smtp://`
- `mailto://`
- `miaotixing://`
- `pushplus://`
- `wxpusher://`

Runtime 本身不默认绑定这些 Provider，这是为了保持 Runtime-first 和 Provider 插件化。

## 中间件示例

```ts
import {
  NotificationRuntime,
  createDefaultProviderRegistry,
  retryMiddleware,
  timeoutMiddleware
} from 'unicall';

const runtime = new NotificationRuntime({
  registry: createDefaultProviderRegistry(),
  middleware: [
    timeoutMiddleware({ timeoutMs: 5000 }),
    retryMiddleware({ retries: 2 })
  ]
});
```

## 结果处理

```ts
const results = await runtime.send({
  title: '告警',
  text: 'CPU 使用率过高。'
});

for (const result of results) {
  if (!result.success) {
    console.error(result.provider, result.error?.message, result.retryable);
  }
}
```

每个目标都会返回一个 `SendResult`。Provider 抛出的未知错误会被归一为 `ProviderSendError`。
