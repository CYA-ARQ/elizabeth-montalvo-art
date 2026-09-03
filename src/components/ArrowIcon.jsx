export default function ArrowIcon({ direction = 'right' }) {
  const rotation = direction === 'left' ? 'rotate(180 12 12)' : undefined

  return (
    <svg
      aria-hidden="true"
      className="arrow-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform={rotation}>
        <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14.5 6.5L20 12L14.5 17.5" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </svg>
  )
}
