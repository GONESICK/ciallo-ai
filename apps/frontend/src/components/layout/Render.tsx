import markdownit from 'markdown-it';
// 按需加载 highlight.js 核心和语言包
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import java from 'highlight.js/lib/languages/java';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import 'highlight.js/styles/atom-one-dark.css';
import { useCopyCode } from '@/hooks/useCopyCode';
import type { ContentBlock } from '@repo/shared';

// 注册语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('jsx', javascript);
hljs.registerLanguage('tsx', typescript);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('vue', xml); // Vue 使用 xml 语法
hljs.registerLanguage('css', css);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('java', java);
hljs.registerLanguage('go', go);
hljs.registerLanguage('golang', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('rs', rust);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);

const md = markdownit({
    html: true,
    linkify: true,
    breaks: true,
    highlight: function (str, lang): string {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return (
                    '<pre class="hljs code-block"><div class="flex justify-between items-center px-2 py-2 mb-2"><span class="text-gray-400 text-xs">' +
                    lang +
                    '</span><button class="copy-btn bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded">复制</button></div><code class="hljs">' +
                    hljs.highlight(str, {
                        language: lang,
                        ignoreIllegals: true,
                    }).value +
                    '</code></pre>'
                );
            } catch (e) {
                console.error(e);
            }
        }

        return (
            '<pre class="hljs code-block"><div class="flex justify-end items-center px-2 py-2 mb-2"><button class="copy-btn bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded">复制</button></div><code class="hljs">' +
            md.utils.escapeHtml(str) +
            '</code></pre>'
        );
    },
});

export const Render = ({ content }: { content: string | ContentBlock[] }) => {
    useCopyCode();
    if (typeof content === 'string') {
        return <MarkText content={content} />;
    }
    return content?.map((item, i) => {
        if (item.type === 'text') {
            return <MarkText content={item.text} key={i} />;
        }
        return null;
    });
};

const MarkText = ({ content }: { content: string }) => {
    return (
        <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: md.render(content) }}
        ></div>
    );
};
// const MarkImage = (content: ContentItem) => {};
