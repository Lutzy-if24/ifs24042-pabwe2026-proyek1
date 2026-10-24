import MarkdownIt from 'markdown-it';
import katex from '@vscode/markdown-it-katex';

// html: false -> tag HTML mentah di konten tidak dirender (aman dari XSS)
const md = new MarkdownIt({ html: false, linkify: true });
md.use(katex.default || katex, { throwOnError: false });

export const renderMarkdown = (source) => md.render(source || '');
