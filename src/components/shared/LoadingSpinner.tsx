import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({
  text = 'Loading...',
}: {
  text?: string
}) {
  return (
    <div className="flex flex-col items-center
                    justify-center h-40 gap-2">
      <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  )
}