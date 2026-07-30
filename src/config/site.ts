export const SITE = {
  title: 'Rwitesh Bera',
  description:
    'Software Engineer building scalable systems, distributed infrastructure, backend services, databases, observability, and AI tooling.',
  author: 'Rwitesh Bera',
  location: 'India',
  timezone: 'Asia/Kolkata',
  url: 'https://rwitesh.com',
  email: 'rwiteshbera@gmail.com',
  googleAnalyticsId: 'G-9FMT8Z6S9C',
  social: {
    github: 'https://github.com/rwitesh',
    x: 'https://x.com/rwiteshbera',
    linkedin: 'https://www.linkedin.com/in/rwiteshbera',
  },
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Posts', href: '/posts' },
  ],
  footer: {
    text: `© ${new Date().getFullYear()} Rwitesh Bera`,
  },
} as const;

export type Site = typeof SITE;