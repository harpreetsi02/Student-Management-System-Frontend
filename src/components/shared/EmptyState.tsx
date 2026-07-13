import { LucideIcon } from 'lucide-react'

export default function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center
                    justify-center py-16 text-slate-400">
      <Icon className="h-12 w-12 mb-3 text-slate-300" />
      <p className="font-medium text-slate-500">{title}</p>
      {description && (
        <p className="text-sm mt-1">{description}</p>
      )}
    </div>
  )
}