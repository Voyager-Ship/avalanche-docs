"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlarmClock } from 'lucide-react';

// Mapping of UTC offsets to major cities/regions
const timezoneMap: Record<number, string[]> = {
  "-12": ["Baker Island, US Minor Outlying Islands"],
  "-11": ["Pago Pago, American Samoa"],
  "-10": ["Honolulu, Hawaii"],
  "-9": ["Anchorage, Alaska"],
  "-8": ["Los Angeles, Vancouver"],
  "-7": ["Phoenix, Denver"],
  "-6": ["Chicago, Mexico City"],
  "-5": ["Bogotá, New York"],
  "-4": ["Santiago, Santo Domingo"],
  "-3": ["São Paulo, Buenos Aires"],
  "-2": ["Fernando de Noronha, Brazil"],
  "-1": ["Azores, Cape Verde"],
  "0": ["London, Dublin"],
  "1": ["Berlin, Paris"],
  "2": ["Cairo, Jerusalem"],
  "3": ["Moscow, Istanbul"],
  "4": ["Dubai, Baku"],
  "5": ["Karachi, Tashkent"],
  "6": ["Dhaka, Almaty"],
  "7": ["Bangkok, Jakarta"],
  "8": ["Singapore, Beijing"],
  "9": ["Tokyo, Seoul"],
  "10": ["Sydney, Melbourne"],
  "11": ["Noumea, Solomon Islands"],
  "12": ["Auckland, Fiji"],
  "13": ["Samoa, Tonga"],
  "14": ["Kiritimati, Line Islands"],
}

export function TimeZoneSelect() {
  const [selectedTimezone, setSelectedTimezone] = useState<string>("")
  const utcOffsets = Array.from({ length: 27 }, (_, i) => i - 12)

  useEffect(() => {
    // Get local UTC offset in minutes and convert to hours
    const localOffset = new Date().getTimezoneOffset() / -60
    // Round to nearest hour to match our options
    const roundedOffset = Math.round(localOffset).toString()
    setSelectedTimezone(roundedOffset)
  }, [])

  const formatTimezoneLabel = (offset: number) => {
    const sign = offset >= 0 ? "+" : ""
    const cities = timezoneMap[offset] ? timezoneMap[offset].join(", ") : "Unknown Region"
    return `(UTC${sign}${offset}:00) ${cities}`
  }

  return (
    <div className="flex w-full max-w-md items-center gap-1.5 text-zinc-400" color="#a1a1aa">
      <Label htmlFor="timezone" className="pr-3 text-zinc-50">Time Zone: </Label>
      <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
        <SelectTrigger className="w-[270px] [&>svg]:text-zinc-400 rounded-md" id="timezone" color="#a1a1aa">
          <AlarmClock className="h-5 w-5" color="#a1a1aa" /** text-zinc-400 = #a1a1aa */ />
          <SelectValue placeholder="Select timezone" color="#a1a1aa" />
        </SelectTrigger>
        <SelectContent color="#a1a1aa">
          {utcOffsets.map((offset) => (
            <SelectItem key={offset} value={offset.toString()} className="whitespace-nowrap">
              {formatTimezoneLabel(offset)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

