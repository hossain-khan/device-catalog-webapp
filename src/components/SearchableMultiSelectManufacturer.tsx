import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, CaretDown, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SearchableMultiSelectManufacturerProps {
  manufacturers: string[];
  selectedManufacturers: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  maxDisplayedItems?: number;
}

export const SearchableMultiSelectManufacturer = ({
  manufacturers,
  selectedManufacturers,
  onSelectionChange,
  placeholder = "Select manufacturers...",
  maxDisplayedItems = 2
}: SearchableMultiSelectManufacturerProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredManufacturers = manufacturers.filter(manufacturer =>
    manufacturer.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (manufacturer: string) => {
    const isSelected = selectedManufacturers.includes(manufacturer);
    if (isSelected) {
      onSelectionChange(selectedManufacturers.filter(m => m !== manufacturer));
    } else {
      onSelectionChange([...selectedManufacturers, manufacturer]);
    }
  };

  const handleRemove = (manufacturer: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectionChange(selectedManufacturers.filter(m => m !== manufacturer));
  };

  const clearAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectionChange([]);
  };

  const displayedManufacturers = selectedManufacturers.slice(0, maxDisplayedItems);
  const remainingCount = selectedManufacturers.length - maxDisplayedItems;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between h-auto min-h-[36px] p-2"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedManufacturers.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {displayedManufacturers.map(manufacturer => (
                  <Badge
                    key={manufacturer}
                    variant="secondary"
                    className="text-xs hover:bg-secondary/80 cursor-pointer flex items-center gap-1"
                  >
                    {manufacturer}
                    <X 
                      className="h-3 w-3" 
                      onClick={(e) => handleRemove(manufacturer, e)}
                    />
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    +{remainingCount} more
                  </Badge>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {selectedManufacturers.length > 0 && (
              <X 
                className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" 
                onClick={clearAll}
              />
            )}
            <CaretDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search manufacturers..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>No manufacturer found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {filteredManufacturers.map((manufacturer) => (
                <CommandItem
                  key={manufacturer}
                  value={manufacturer}
                  onSelect={() => handleSelect(manufacturer)}
                  className="cursor-pointer group"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-primary",
                      selectedManufacturers.includes(manufacturer) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {manufacturer}
                  {selectedManufacturers.includes(manufacturer) && (
                    <Badge variant="outline" className="ml-auto text-xs group-hover:text-primary-foreground group-hover:border-primary-foreground/50">
                      Selected
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};