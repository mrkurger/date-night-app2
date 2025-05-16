import { Card, CardContent } from "@/components/ui/card"
import { DollarSign } from "lucide-react"

interface ServiceCardProps {
  service: {
    name: string
    price: string
    description?: string
  }
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:border-pink-500/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">{service.name}</h3>
          <div className="flex items-center text-green-500">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>{service.price}</span>
          </div>
        </div>
        {service.description && <p className="text-sm text-gray-400">{service.description}</p>}
      </CardContent>
    </Card>
  )
}
