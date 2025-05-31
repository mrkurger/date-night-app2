"use client"

export function DebugInfo({ data, title = "Debug Info" }: { data: any; title?: string }) {
  return (
    <div className="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
      <h3 className="font-bold mb-2">{title}</h3>
      <pre className="text-xs overflow-auto max-h-[300px]">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
