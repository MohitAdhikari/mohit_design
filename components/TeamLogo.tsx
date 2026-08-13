import Image from 'next/image'

interface TeamLogoProps {
  src?: string | null
  name: string
  size?: number
  className?: string
  fallbackClassName?: string
}

export default function TeamLogo({
  src,
  name,
  size = 64,
  className = '',
  fallbackClassName = '',
}: TeamLogoProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`object-contain ${className}`}
      />
    )
  }

  const initials = (name || 'T').slice(0, 2).toUpperCase()

  return (
    <div
      className={`rounded-full bg-gray-100 dark:bg-[#13131A] flex items-center justify-center font-black text-gray-400 dark:text-gray-600 select-none ${fallbackClassName}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  )
}
