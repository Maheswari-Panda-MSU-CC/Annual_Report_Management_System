"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface SearchableSelectOption {
  value: string | number
  label: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string | number
  onValueChange: (value: string | number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  emptyMessage?: string
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  disabled = false,
  className,
  emptyMessage = "No option found.",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((opt) => String(opt.value) === String(value))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-sm sm:text-md h-9 sm:h-10", className)}
          disabled={disabled}
        >
          <span className="truncate text-left flex-1">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 text-sm sm:text-sm" align="start">
        <Command shouldFilter>
          <CommandInput placeholder="Search..." className="text-sm sm:text-sm" />
          <CommandList>
            <CommandEmpty className="text-sm sm:text-sm">{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                  className="text-sm sm:text-sm"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4",
                      String(value) === String(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

