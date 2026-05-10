import { getInitials } from "@/lib/utils"

interface UserAvatarProps {
  name?: string | null
  url?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZE = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-2xl",
} as const

export function UserAvatar({ name, url, size = "md", className = "" }: UserAvatarProps) {
  const cls = `${SIZE[size]} rounded-full object-cover shrink-0 ${className}`
  if (url) {
    return <img src={url} alt={name ?? ""} className={cls} />
  }
  return (
    <span
      className={`flex items-center justify-center rounded-full font-bold text-white uppercase shrink-0 ${SIZE[size]} ${className}`}
      style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
    >
      {getInitials(name)}
    </span>
  )
}
