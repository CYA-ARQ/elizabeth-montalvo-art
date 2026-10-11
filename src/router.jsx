import { useSyncExternalStore } from 'react'

// GitHub Pages does not provide an SPA fallback for direct route requests.
// Keep hash navigation in production so every page resolves through index.html,
// including when the site is served from its custom domain root.
const useHashRouting = import.meta.env.PROD

function subscribe(callback) {
  window.addEventListener('popstate', callback)
  window.addEventListener('hashchange', callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener('hashchange', callback)
  }
}

function getSnapshot() {
  if (useHashRouting) {
    const hashPath = window.location.hash.slice(1)
    return hashPath.startsWith('/') ? hashPath : '/'
  }

  return window.location.pathname
}

export function usePathname() {
  return useSyncExternalStore(subscribe, getSnapshot, () => '/')
}

function navigate(to) {
  if (useHashRouting) {
    if (getSnapshot() !== to) window.location.hash = to
    return
  }

  if (window.location.pathname === to) return
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function Link({ children, onClick, to, ...props }) {
  const href = useHashRouting ? `${import.meta.env.BASE_URL}#${to}` : to

  const handleClick = (event) => {
    onClick?.(event)
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (event.currentTarget.target && event.currentTarget.target !== '_self')
    ) {
      return
    }

    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}

export function NavLink({ className, end = false, to, ...props }) {
  const pathname = usePathname()
  const isActive = end ? pathname === to : pathname.startsWith(to)
  const resolvedClassName =
    typeof className === 'function' ? className({ isActive }) : className

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={resolvedClassName}
      to={to}
      {...props}
    />
  )
}
