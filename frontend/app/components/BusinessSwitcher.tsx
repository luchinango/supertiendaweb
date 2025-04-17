"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Business } from "../types"


interface BusinessSwitcherProps {
  businesses: Business[]
  currentBusiness: Business
  onBusinessChange: (business: Business) => void
  onAddBusiness: () => void
}

export function BusinessSwitcher({
  businesses,
  currentBusiness,
  onBusinessChange,
  onAddBusiness,
}: BusinessSwitcherProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Seleccionar negocio"
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currentBusiness.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{currentBusiness.name}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Buscar negocio..." />
            <CommandEmpty>No se encontraron negocios.</CommandEmpty>
            <CommandGroup heading="Tus negocios">
              {businesses.map((business) => (
                <CommandItem
                  key={business.id}
                  onSelect={() => {
                    onBusinessChange(business)
                    setOpen(false)
                  }}
                  className="text-sm"
                >
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {business.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{business.name}</span>
                  <Check
                    className={cn("ml-auto h-4 w-4", currentBusiness.id === business.id ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onAddBusiness()
                  setOpen(false)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar otro negocio
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
