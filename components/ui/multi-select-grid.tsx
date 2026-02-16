import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface MultiSelectGridProps {
    items: readonly string[] | string[]
    selected: string[]
    onChange: (selected: string[]) => void
    disabled?: boolean
}

export function MultiSelectGrid({
    items,
    selected,
    onChange,
    disabled = false,
}: MultiSelectGridProps) {
    const handleToggle = (item: string) => {
        if (selected.includes(item)) {
            onChange(selected.filter(s => s !== item))
        } else {
            onChange([...selected, item])
        }
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {items.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                            id={`item-${item}`}
                            checked={selected.includes(item)}
                            onCheckedChange={() => handleToggle(item)}
                            disabled={disabled}
                        />
                        <Label
                            htmlFor={`item-${item}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            {item}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    )
}
