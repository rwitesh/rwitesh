export const SITE = {
  title: 'Rwitesh Bera',
  description:
    'Software Engineer building scalable systems, distributed infrastructure, backend services, databases, observability, and AI tooling.',
  author: 'Rwitesh Bera',
  url: 'https://rwitesh.dev',
  email: 'rwiteshbera@gmail.com',
  social: {
    github: 'https://github.com/rwitesh',
    x: 'https://x.com/rwiteshbera',
    linkedin: 'https://www.linkedin.com/in/rwiteshbera',
  },
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
  ],
  footer: {
    text: `© ${new Date().getFullYear()} Rwitesh Bera`,
  },
} as const;

export type Site = typeof SITE;