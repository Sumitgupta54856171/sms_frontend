"use client"

import * as React from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default  function DatePickerSimple({DateTitle,date,setDate}: {DateTitle: string,date?: Date,setDate?: (date: Date)=> void}) {
  

  return (
    <Field className="mx-auto w-44">
     
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker-simple"
            className="justify-start font-normal"
          >
            {date ? format(date, "PPP") : <span>{DateTitle}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => selectedDate && setDate?.(selectedDate)}
            defaultMonth={date}
            required={false}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
