import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import type { NavItem as NavItemType } from '../../constants/navigation'
import { useFavorites } from '../../hooks/useFavorites'

// Map paths to nav translation keys
const PATH_TO_KEY: Record<string, string> = {
  '/': 'home',
  // Converters
  '/password': 'password',
  '/qr': 'qr',
  '/datetime': 'datetime',
  '/files': 'files',
  '/hijri': 'hijri',
  '/units': 'units',
  '/currency': 'currency',
  '/roman': 'roman',
  '/world-clock': 'worldClock',
  // Text Tools
  '/case': 'case',
  '/json': 'json',
  '/word-count': 'wordCount',
  '/markdown': 'markdown',
  '/diff': 'diff',
  '/regex': 'regex',
  '/sort-lines': 'sortLines',
  '/find-replace': 'findReplace',
  '/sql': 'sql',
  '/yaml': 'yaml',
  '/morse': 'morse',
  // Dev Tools
  '/hash': 'hash',
  '/base64': 'base64',
  '/url-encode': 'urlEncode',
  '/jwt': 'jwt',
  '/cron': 'cron',
  '/base-convert': 'baseConvert',
  '/color': 'color',
  '/http-status': 'httpStatus',
  '/mime': 'mime',
  '/user-agent': 'userAgent',
  '/html-entities': 'htmlEntities',
  '/subnet': 'subnet',
  '/json-ts': 'jsonTs',
  // Generators
  '/uuid': 'uuid',
  '/lorem': 'lorem',
  '/random': 'random',
  '/fake-data': 'fakeData',
  '/gradient': 'gradient',
  '/box-shadow': 'boxShadow',
  '/favicon': 'favicon',
  '/meta-tags': 'metaTags',
  // Calculators
  '/age': 'age',
  '/percentage': 'percentage',
  '/loan': 'loan',
  '/bmi': 'bmi',
  '/tip': 'tip',
  '/date-diff': 'dateDiff',
  '/duration': 'duration',
  '/scientific': 'scientific',
  '/prime': 'prime',
  // Image Tools
  '/resize': 'resize',
  '/compress': 'compress',
  '/color-pick': 'colorPick',
  '/crop': 'crop',
  '/rotate': 'rotate',
  '/svg-png': 'svgPng',
  '/exif': 'exif',
  '/placeholder': 'placeholder',
  // Fun
  '/coin-flip': 'coinFlip',
  '/dice': 'dice',
  '/decide': 'decide',
  '/emoji': 'emoji',
}

interface NavItemProps {
  item: NavItemType
  onClick?: () => void
}

export function NavItem({ item, onClick }: NavItemProps) {
  const { t } = useTranslation()
  const favs = useFavorites()
  const Icon = item.icon
  const key = PATH_TO_KEY[item.path]
  const label = key ? t(`nav.${key}`) : item.label
  const isHome = item.path === '/'
  const isFav = favs.isFav(item.path)

  const toggleFav = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    favs.toggle(item.path)
  }

  // The favorite "button" must be a span (not <button>) because nesting an
  // interactive element inside NavLink (<a>) is invalid HTML and breaks click
  // handling in some browsers / React 19 strict mode.
  return (
    <NavLink
      to={item.path}
      end={isHome}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-base-300 text-base-content font-medium'
            : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
        }`
      }
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {!isHome && (
        <span
          role="button"
          tabIndex={-1}
          onClick={toggleFav}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleFav(e)
          }}
          className={`shrink-0 cursor-pointer transition-opacity ${
            isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-60 hover:opacity-100!'
          }`}
          aria-label={isFav ? t('tooltip.removeFavorite') : t('tooltip.addFavorite')}
          title={isFav ? t('tooltip.removeFavorite') : t('tooltip.addFavorite')}
        >
          <Star size={13} className={isFav ? 'fill-yellow-500 text-yellow-500' : ''} />
        </span>
      )}
    </NavLink>
  )
}
