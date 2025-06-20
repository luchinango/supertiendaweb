"use client"

import * as React from "react"
import { format } from "date-fns"
import type { Locale } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangePickerProps {
  className?: string
  date: DateRange
  onDateChange: (date: DateRange) => void
  locale?: Locale
}

export function DateRangePicker({ className, date, onDateChange, locale = es }: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "d LLL", { locale })} - {format(date.to, "d LLL", { locale })}
                </>
              ) : (
                format(date.from, "d LLL", { locale })
              )
            ) : (
              <span>Seleccionar fecha</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            {...(date?.from ? { defaultMonth: date.from } : {})}
            selected={date}
            onSelect={(range: DateRange | undefined) => range && onDateChange(range)}
            numberOfMonths={1}
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
