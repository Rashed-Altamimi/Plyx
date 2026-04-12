import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import yaml from 'js-yaml'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'

export function YamlJson() {
  const { t } = useTranslation()
  useDocumentTitle(t('yaml.title'))
  const [yamlText, setYamlText] = useState('name: Plyx\nversion: 1.0\nfeatures:\n  - tools\n  - i18n\n  - themes')
  const [jsonText, setJsonText] = useState('')
  const [yamlError, setYamlError] = useState('')
  const [jsonError, setJsonError] = useState('')

  const yamlToJson = () => {
    try {
      const parsed = yaml.load(yamlText)
      setJsonText(JSON.stringify(parsed, null, 2))
      setYamlError('')
      setJsonError('')
    } catch (e) {
      setYamlError((e as Error).message)
    }
  }

  const jsonToYaml = () => {
    try {
      const parsed = JSON.parse(jsonText)
      setYamlText(yaml.dump(parsed))
      setYamlError('')
      setJsonError('')
    } catch (e) {
      setJsonError((e as Error).message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('yaml.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('yaml.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-base-content/70">{t('yaml.yamlLabel')}</label>
            {yamlText && <CopyButton text={yamlText} />}
          </div>
          <Textarea value={yamlText} onChange={(e) => setYamlText(e.target.value)} rows={14} className="font-mono text-xs" />
          {yamlError && <p className="text-xs text-red-500">{yamlError}</p>}
          <Button onClick={yamlToJson} className="w-full">{t('yaml.yamlToJson')}</Button>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-base-content/70">{t('yaml.jsonLabel')}</label>
            {jsonText && <CopyButton text={jsonText} />}
          </div>
          <Textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={14} className="font-mono text-xs" />
          {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
          <Button onClick={jsonToYaml} variant="outline" className="w-full">{t('yaml.jsonToYaml')}</Button>
        </Card>
      </div>
    </div>
  )
}
