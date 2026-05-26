import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Unicall',
  description: 'URL 驱动的轻量通知运行时',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/runtime' },
      { text: 'Provider', link: '/providers/webhook' },
      { text: '贡献', link: '/contribute/testing' },
      { text: 'GitHub', link: 'https://github.com/noblesnowfield/unicall.git' }
    ],
    sidebar: [
      {
        text: '开始使用',
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '接入方式', link: '/guide/integration' },
          { text: '核心概念', link: '/guide/concepts' },
          { text: '消息格式', link: '/guide/message-format' },
          { text: 'HTML 模板', link: '/guide/html-templates' }
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'Runtime 与 notify', link: '/api/runtime' },
          { text: '类型定义', link: '/api/types' }
        ]
      },
      {
        text: 'Provider',
        items: [
          { text: 'Webhook', link: '/providers/webhook' },
          { text: 'Email / SMTP', link: '/providers/email' },
          { text: '喵提醒', link: '/providers/miaotixing' },
          { text: 'Pushplus', link: '/providers/pushplus' },
          { text: 'WxPusher', link: '/providers/wxpusher' }
        ]
      },
      {
        text: '测试与贡献',
        items: [
          { text: '测试与贡献', link: '/contribute/testing' }
        ]
      }
    ],
    outline: {
      label: '本页目录',
      level: [2, 3]
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/noblesnowfield/unicall.git' }
    ]
  }
});
