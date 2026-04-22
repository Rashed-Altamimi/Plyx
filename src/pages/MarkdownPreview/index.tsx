import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useDebounced } from '../../hooks/useDebounced'
import { Tabs } from '../../components/ui/Tabs'

const DEFAULT_MD = `# Hello, Markdown!

Write **bold**, *italic*, or \`inline code\`.

## Lists

- Item one
- Item two
  - Nested item

## Code block

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`
\`\`\`

## Table

| Name  | Role     |
|-------|----------|
| Alice | Engineer |
| Bob   | Designer |

> A blockquote looks like this.

[Link example](https://example.com)
`

export function MarkdownPreview() {
  const { t } = useTranslation()
  useDocumentTitle(t('markdown.title'))
  const [text, setText] = useState(DEFAULT_MD)
  const [view, setView] = useState('split')
  const debouncedText = useDebounced(text, 120)

  const TABS = [
    { id: 'split',   label: t('markdown.split') },
    { id: 'write',   label: t('markdown.write') },
    { id: 'preview', label: t('markdown.preview') },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-0px)]">
      <div className="px-6 py-4 border-b border-base-200 bg-base-100 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-base-content">{t('markdown.title')}</h1>
        </div>
        <Tabs tabs={TABS} active={view} onChange={setView} className="w-52" />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {(view === 'split' || view === 'write') && (
          <div className={`flex flex-col ${view === 'split' ? 'w-1/2 border-r border-base-200' : 'w-full'}`}>
            <div className="px-4 py-2 border-b border-base-200 bg-base-200">
              <span className="text-xs text-base-content/40 font-medium">{t('markdown.markdownLabel')}</span>
            </div>
            <textarea
              className="flex-1 p-4 font-mono mono-prose text-sm text-base-content resize-none outline-none bg-base-100"
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
            />
          </div>
        )}

        {(view === 'split' || view === 'preview') && (
          <div className={`flex flex-col ${view === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto`}>
            <div className="px-4 py-2 border-b border-base-200 bg-base-200 shrink-0">
              <span className="text-xs text-base-content/40 font-medium">{t('markdown.previewLabel')}</span>
            </div>
            <div className="p-6 prose prose-sm max-w-none prose-neutral">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{debouncedText}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
