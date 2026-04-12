import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { CopyButton } from '../../components/ui/CopyButton'

export function MetaTagGenerator() {
  const { t } = useTranslation()
  useDocumentTitle(t('metaTags.title'))
  const [title, setTitle] = useState('My Awesome Site')
  const [description, setDescription] = useState('A short description of your site for search engines and social media.')
  const [url, setUrl] = useState('https://example.com')
  const [image, setImage] = useState('https://example.com/preview.jpg')
  const [twitter, setTwitter] = useState('@handle')
  const [ogType, setOgType] = useState('website')

  const output = useMemo(() => {
    const lines = [
      '<!-- Primary Meta Tags -->',
      `<title>${title}</title>`,
      `<meta name="title" content="${title}" />`,
      `<meta name="description" content="${description}" />`,
      '',
      '<!-- Open Graph / Facebook -->',
      `<meta property="og:type" content="${ogType}" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:title" content="${title}" />`,
      `<meta property="og:description" content="${description}" />`,
      `<meta property="og:image" content="${image}" />`,
      '',
      '<!-- Twitter -->',
      `<meta property="twitter:card" content="summary_large_image" />`,
      `<meta property="twitter:url" content="${url}" />`,
      `<meta property="twitter:title" content="${title}" />`,
      `<meta property="twitter:description" content="${description}" />`,
      `<meta property="twitter:image" content="${image}" />`,
      `<meta property="twitter:site" content="${twitter}" />`,
    ]
    return lines.join('\n')
  }, [title, description, url, image, twitter, ogType])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('metaTags.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('metaTags.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <Input label={t('metaTags.siteTitle')} value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea label={t('metaTags.description')} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <Input label={t('metaTags.url')} value={url} onChange={(e) => setUrl(e.target.value)} />
        <Input label={t('metaTags.image')} value={image} onChange={(e) => setImage(e.target.value)} />
        <Input label={t('metaTags.twitterHandle')} value={twitter} onChange={(e) => setTwitter(e.target.value)} />
        <Select label={t('metaTags.ogType')} value={ogType} onChange={(e) => setOgType(e.target.value)}>
          <option value="website">website</option>
          <option value="article">article</option>
          <option value="product">product</option>
          <option value="profile">profile</option>
        </Select>
      </Card>

      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-base-content/70">{t('metaTags.output')}</label>
          <CopyButton text={output} />
        </div>
        <Textarea value={output} readOnly rows={18} className="font-mono text-xs" />
      </Card>
    </div>
  )
}
