import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ServiceCardProps {
  service: {
    name: string
    price: string
    description: string
  }
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{service.name}</h3>
          <span className="text-lg font-bold text-green-400">{service.price}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-300 mb-4">{service.description}</p>
        <Button className="w-full bg-pink-600 hover:bg-pink-700">Book Now</Button>
      </CardContent>
    </Card>
  )
}
