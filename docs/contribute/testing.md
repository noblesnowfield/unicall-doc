# 测试与贡献

Unicall 的测试原则是：CI 只跑 mock 网络请求，不真实调用外部通知服务；真实推送通过本地手动脚本完成。

## 本地命令

在 SDK 仓库中运行：

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
```

文档站本地启动：

```bash
pnpm install
pnpm docs:dev
```

默认地址：

```text
http://127.0.0.1:5173
```

## 新增 Provider

新增 Provider 建议按这个顺序做：

1. 在 `src/providers/<name>/` 实现 Provider 和 Factory。
2. Provider 实现共享 `NotificationProvider` 接口。
3. URL 参数解析放在 Provider 内部，Runtime 不感知渠道细节。
4. 把 Factory 注册到 `createDefaultProviderRegistry()`。
5. 在 `src/index.ts` 导出公开 API。
6. 新增 `test/providers/<name>.test.ts`，mock 网络请求。
7. 新增 `examples/templates/<name>-*.ts` 模板 demo。
8. 新增 `scripts/send/<name>.ts` 手动推送脚本。
9. 更新 `unicall.config.example.mjs` 和 `.env.example`。
10. 更新文档站 Provider 页面。

Provider 文件应保持独立，避免互相依赖。

## mock 测试

测试必须拦截网络请求：

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
});

it('发送消息到 provider', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(JSON.stringify({ code: 200 }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    )
  );

  // 调用 Provider 或 Runtime，并断言 fetch 参数。
});
```

不要在测试里读取真实 `.env.local`，也不要真实访问外部服务。

## 手动推送脚本

真实推送脚本统一读取 JS 配置结构：

```bash
pnpm exec tsx scripts/send/pushplus.ts --profile default
```

脚本应遵守：

- 读取 `unicall.config.local.mjs`；不存在时回退 `unicall.config.example.mjs`。
- 支持 `--profile`。
- 真实敏感值来自 `process.env.UNICALL_<CHANNEL>_<PROFILE>_<FIELD>`。
- 日志里只输出脱敏值，不打印完整 token、secret、password。
- 模板内容来自 `examples/templates` 或配置文件中的 `templates`。

## 配置与 Secret

可提交：

- `unicall.config.example.mjs`
- `.env.example`
- 文档示例里的占位符

不可提交：

- `unicall.config.local.mjs`
- `.env.local`
- 任何真实 token、password、secret、appToken、喵码

## 文档同步

当 Provider 行为变化时，需要同步检查：

- URL 格式和参数表。
- 环境变量命名。
- 消息格式映射和降级规则。
- 手动脚本命令和模板 demo。
- 浏览器安全边界。

文档示例应与测试脚本和 `unicall.config.example.mjs` 保持一致。
