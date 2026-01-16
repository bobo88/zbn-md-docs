const { getChildren } = require('./utils/autoSidebar');
const BASE_PATH = './docs';

module.exports = {
  title: '深圳中博纳 - 技术文档手册',
  description: '技术清单文档',
  head: [['link', { rel: 'shortcut icon', type: 'image/x-icon', href: `/favicon.ico` }]],
  themeConfig: {
    nav: [
      { text: '普通文档', link: '/new/' },
      { text: '前端文档', link: '/FE/' },
      { text: '后端文档', link: '/RD/' },
      { text: '运维文档', link: '/CICD/' },
      { text: 'loT文档', link: '/loT/' },
      { text: 'AI文档', link: '/AI/' },
    ],
    sidebar: {
      '/new/': [
        {
          title: '普通文档',
          path: '/new/',
          collapsable: false,
          sidebarDepth: 2,
          children: getChildren(BASE_PATH + '/new/'),
        },
      ],
      '/FE/': [
        {
          title: '前端文档',
          path: '/FE/',
          collapsable: false,
          sidebarDepth: 2,
          children: getChildren(BASE_PATH + '/FE/'),
        },
      ],
      '/RD/': [
        {
          title: '后端文档',
          path: '/RD/',
          collapsable: false,
          sidebarDepth: 2,
          children: getChildren(BASE_PATH + '/RD/'),
        },
      ],
      '/CICD/': [
        {
          title: '运维文档',
          path: '/CICD/',
          collapsable: false,
          sidebarDepth: 2,
          children: getChildren(BASE_PATH + '/CICD/'),
        },
      ],
      '/loT/': [
        {
          title: 'loT文档',
          path: '/loT/',
          collapsable: false,
          sidebarDepth: 2,
          children: getChildren(BASE_PATH + '/loT/'),
        },
      ],
      '/AI/': [
        {
          title: 'AI文档',
          path: '/AI/',
          collapsable: false,
          sidebarDepth: 2,
          children: getChildren(BASE_PATH + '/AI/'),
        },
      ],
    },
  },
  markdown: {
    lineNumbers: true,
  },
  configureWebpack: {
    stats: 'errors-only',
    performance: { hints: false }, // 移除 webpack 打包时的性能提示
    resolve: {
      alias: {
        '@': '../.vuepress/images',
        '~': './.vuepress/images',
      },
    },
  },

  chainWebpack: (config) => {
    config.module.rules.delete('eslint');
    config.module.rules.delete('ts');
  },
};
