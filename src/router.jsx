import { useSyncExternalStore } from 'react'

function subscribe(callback) {
  window.addEventListener('popstate', callback)
  return () => window.removeEventListener('popstate', callback)
}

function getSnapshot() {
  return window.location.pathname
}

export function usePathname() {
  return useSyncExternalStore(subscribe, getSnapshot, () => '/')
}

function navigate(to) {
  if (window.location.pathname === to) return
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function Link({ children, onClick, to, ...props }) {
  const handleClick = (event) => {
    onClick?.(event)
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={handleClick} {...props}>
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
