import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CodeNotify",
  description: "Smart Contest Alert System - Multi-platform competitive programming notifications",
  base: '/CodeNotify/',


  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: {
      light: 'https://v8sn4u5d65xaovfn.public.blob.vercel-storage.com/CodeNotify%20light.png',
      dark: 'https://v8sn4u5d65xaovfn.public.blob.vercel-storage.com/CodeNotify%20dark.png',
    },
    siteTitle: 'CodeNotify',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction' },
      { 
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/overview' },
          { text: 'Root Endpoint', link: '/api/root' },
          { text: 'Authentication', link: '/api/authentication' },
          { text: 'Users', link: '/api/users' },
          { text: 'Contests', link: '/api/contests' },
          { text: 'Notifications', link: '/api/notifications' }
        ]
      },
      { 
        text: 'Server',
        items: [
          { text: 'Architecture', link: '/server/architecture' },
          { text: 'Modules', link: '/server/modules' },
          { text: 'Platform Adapters', link: '/server/adapters' },
          { text: 'Database', link: '/server/database' }
        ]
      },
      {
        text: 'v0.0.1',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/contributing' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Configuration', link: '/guide/configuration' }
          ]
        },
        {
          text: 'Core Concepts',
          collapsed: false,
          items: [
            { text: 'Architecture Overview', link: '/guide/architecture' },
            { text: 'Authentication Flow', link: '/guide/authentication' },
            { text: 'Notification System', link: '/guide/notifications' },
            { text: 'Platform Integrations', link: '/guide/platforms' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'API Overview', link: '/api/overview' },
            { text: 'Root Endpoint', link: '/api/root' },
            { text: 'Authentication', link: '/api/authentication' },
            { text: 'Error Handling', link: '/api/errors' },
            { text: 'Rate Limiting', link: '/api/rate-limiting' },
            { text: 'Pagination', link: '/api/pagination' }
          ]
        },
        {
          text: 'Authentication',
          collapsed: false,
          items: [
            { text: 'Sign Up', link: '/api/auth/signup' },
            { text: 'Sign In', link: '/api/auth/signin' },
            { text: 'Refresh Token', link: '/api/auth/refresh' },
            { text: 'Sign Out', link: '/api/auth/signout' },
            { text: 'JWT Strategy', link: '/api/auth/jwt-strategy' }
          ]
        },
        {
          text: 'Users',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/users' },
            { text: 'Get Profile', link: '/api/users/profile' },
            { text: 'Update Profile', link: '/api/users/update-profile' },
            { text: 'Get User by ID', link: '/api/users/get-by-id' },
            { text: 'Deactivate Account', link: '/api/users/deactivate' },
            { text: 'Activate Account', link: '/api/users/activate' }
          ]
        },
        {
          text: 'Users (Admin)',
          collapsed: true,
          items: [
            { text: 'List All Users', link: '/api/users/list' },
            { text: 'Update Role', link: '/api/users/update-role' },
            { text: 'Delete User', link: '/api/users/delete' }
          ]
        },
        {
          text: 'Contests',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/contests' },
            { text: 'List All', link: '/api/contests/list' },
            { text: 'Get by ID', link: '/api/contests/get-by-id' },
            { text: 'Upcoming', link: '/api/contests/upcoming' },
            { text: 'Running', link: '/api/contests/running' },
            { text: 'Finished', link: '/api/contests/finished' },
            { text: 'Search', link: '/api/contests/search' },
            { text: 'Filter by Platform', link: '/api/contests/platform' },
            { text: 'Filter by Difficulty', link: '/api/contests/difficulty' },
            { text: 'Filter by Type', link: '/api/contests/type' },
            { text: 'Statistics', link: '/api/contests/stats' },
            { text: 'Platform Stats', link: '/api/contests/platform-stats' },
            { text: 'Health Check', link: '/api/contests/health' }
          ]
        },
        {
          text: 'Contests (Admin)',
          collapsed: true,
          items: [
            { text: 'Create Contest', link: '/api/contests/create' },
            { text: 'Update Contest', link: '/api/contests/update' },
            { text: 'Delete Contest', link: '/api/contests/delete' },
            { text: 'Bulk Create', link: '/api/contests/bulk' },
            { text: 'Sync Platform', link: '/api/contests/sync' },
            { text: 'Sync All Platforms', link: '/api/contests/sync-all' }
          ]
        },
        {
          text: 'Notifications',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/notifications' },
            { text: 'Get History', link: '/api/notifications/history' },
            { text: 'Get by ID', link: '/api/notifications/get-by-id' },
            { text: 'Mark as Read', link: '/api/notifications/mark-as-read' },
            { text: 'Mark All as Read', link: '/api/notifications/mark-all-as-read' },
            { text: 'Get Statistics', link: '/api/notifications/stats' },
            { text: 'Retry Failed', link: '/api/notifications/retry' },
            { text: 'Cleanup Old', link: '/api/notifications/cleanup' }
          ]
        },
        {
          text: 'Notifications (Monitoring)',
          collapsed: true,
          items: [
            { text: 'Service Status', link: '/api/notifications/status' },
            { text: 'Health Check', link: '/api/notifications/health' }
          ]
        },
        {
          text: 'Notifications (Testing)',
          collapsed: true,
          items: [
            { text: 'Test Email', link: '/api/notifications/test-email' },
            { text: 'Test WhatsApp', link: '/api/notifications/test-whatsapp' },
            { text: 'Test Push', link: '/api/notifications/test-push' }
          ]
        },
        {
          text: 'Notifications (Admin)',
          collapsed: true,
          items: [
            { text: 'Send Custom Email', link: '/api/notifications/send-custom-email' },
            { text: 'Send Bulk Email', link: '/api/notifications/send-bulk-email' },
            { text: 'Send Announcement', link: '/api/notifications/send-announcement' },
            { text: 'Send Contest Reminder', link: '/api/notifications/send-contest-reminder' }
          ]
        }
      ],
      '/server/': [
        {
          text: 'Architecture',
          collapsed: false,
          items: [
            { text: 'System Overview', link: '/server/architecture' },
            { text: 'Module Structure', link: '/server/modules' },
            { text: 'Design Patterns', link: '/server/patterns' },
            { text: 'Platform Adapters', link: '/server/adapters' },
            { text: 'Database Design', link: '/server/database' },
            { text: 'Scheduler & Jobs', link: '/server/scheduler' }
          ]
        },
        {
          text: 'Core Modules',
          collapsed: false,
          items: [
            { text: 'Auth Module', link: '/server/modules/auth' },
            { text: 'Users Module', link: '/server/modules/users' },
            { text: 'Contests Module', link: '/server/modules/contests' },
            { text: 'Notifications Module', link: '/server/modules/notifications' },
            { text: 'Integrations Module', link: '/server/modules/integrations' }
          ]
        },
        {
          text: 'Platform Adapters',
          collapsed: true,
          items: [
            { text: 'Adapter Pattern', link: '/server/adapters' },
            { text: 'Base Adapter', link: '/server/adapters/base' },
            { text: 'Codeforces', link: '/server/adapters/codeforces' },
            { text: 'LeetCode', link: '/server/adapters/leetcode' },
            { text: 'CodeChef', link: '/server/adapters/codechef' },
            { text: 'AtCoder', link: '/server/adapters/atcoder' }
          ]
        },
        {
          text: 'Database',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/server/database' },
            { text: 'User Schema', link: '/server/database/user' },
            { text: 'Contest Schema', link: '/server/database/contest' },
            { text: 'Notification Schema', link: '/server/database/notification' },
            { text: 'Indexes & Performance', link: '/server/database/indexes' }
          ]
        },
        {
          text: 'Security',
          collapsed: true,
          items: [
            { text: 'JWT Authentication', link: '/server/security/jwt' },
            { text: 'Password Hashing', link: '/server/security/bcrypt' },
            { text: 'Guards & Strategies', link: '/server/security/guards' }
          ]
        },
        {
          text: 'Deployment',
          collapsed: true,
          items: [
            { text: 'Deployment Guide', link: '/server/deployment' },
            { text: 'Docker Setup', link: '/server/deployment/docker' }
          ]
        },
        {
          text: 'Resources',
          collapsed: true,
          items: [
            { text: 'License', link: '/LICENSE' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Celestial-0/codenotify' }
    ],

    footer: {
      message: 'Built with ❤️ for competitive programmers worldwide.',
      copyright: 'Copyright © 2025 Yash Kumar Singh'
    },

    search: {
      provider: 'local',
      options: {
        detailedView: true
      }
    },

    editLink: {
      pattern: 'https://github.com/Celestial-0/codenotify/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    outline: {
      level: [2, 2],
      label: 'On this page'
    },

    lastUpdated: {
      text: 'Last updated'
    }
  },

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: 'https://v8sn4u5d65xaovfn.public.blob.vercel-storage.com/CodeNotify%20dark.png'   }],
    ['meta', { name: 'theme-color', content: '#1e1e2e' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'CodeNotify | Smart Contest Alert System' }],
    ['meta', { property: 'og:site_name', content: 'CodeNotify' }],
    ['meta', { property: 'og:description', content: 'Multi-platform competitive programming contest notifications' }],
    ['meta', { property: 'og:url', content: 'https://celestial-0.github.io/CodeNotify/' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'CodeNotify Documentation' }]
  ],
  markdown: {
    theme: {
      light: 'catppuccin-latte',
      dark: 'catppuccin-mocha',
    },
    lineNumbers: false
  },

  sitemap: {
    hostname: 'https://celestial-0.github.io/CodeNotify'
  }
})
