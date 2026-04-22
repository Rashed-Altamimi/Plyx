import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star } from '../../icons'
import type { NavItem as NavItemType } from '../../constants/navigation'
import { useFavorites } from '../../hooks/useFavorites'

interface NavItemProps {
  item: NavItemType
  onClick?: () => void
}

export function NavItem({ item, onClick }: NavItemProps) {
  const { t } = useTranslation()
  const favs = useFavorites()
  const Icon = item.icon
  const label = item.i18nKey ? t(`nav.${item.i18nKey}`) : item.label
  const isHome = item.path === '/'
  const isFav = favs.isFav(item.path)

  const toggleFav = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    favs.toggle(item.path)
  }

  return (
    <NavLink
      to={item.path}
      end={isHome}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
          isActive
            ? 'bg-primary/10 text-base-content font-medium'
            : 'text-base-content/60 hover:bg-base-content/5 hover:text-base-content'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute start-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-primary shadow-[0_0_8px_var(--primary-70)]" />
          )}
          <Icon size={14} className={`shrink-0 transition-colors ${isActive ? 'text-primary' : ''}`} />
          <span className="flex-1 truncate">{label}</span>
          {item.isNew && (
            <span className="shrink-0 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary ring-1 ring-inset ring-primary/25">
              {t('sidebar.newBadge')}
            </span>
          )}
          {!isHome && (
            <span
              role="button"
              tabIndex={-1}
              onClick={toggleFav}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleFav(e)
              }}
              className={`shrink-0 cursor-pointer transition-opacity ${
                isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-50 hover:opacity-100!'
              }`}
              aria-label={isFav ? t('tooltip.removeFavorite') : t('tooltip.addFavorite')}
              title={isFav ? t('tooltip.removeFavorite') : t('tooltip.addFavorite')}
            >
              <Star size={12} className={isFav ? 'fill-yellow-500 text-yellow-500' : ''} />
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}
