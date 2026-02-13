import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface MultiSelectSpecialitiesProps {
    specialities: string[]
    selected: string[]
    onChange: (selected: string[]) => void
    disabled?: boolean
}

export function MultiSelectSpecialities({
    specialities,
    selected,
    onChange,
    disabled = false,
}: MultiSelectSpecialitiesProps) {
    const handleToggle = (speciality: string) => {
        if (selected.includes(speciality)) {
            onChange(selected.filter(s => s !== speciality))
        } else {
            onChange([...selected, speciality])
        }
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {specialities.map((speciality) => (
                    <div key={speciality} className="flex items-center space-x-2">
                        <Checkbox
                            id={`speciality-${speciality}`}
                            checked={selected.includes(speciality)}
                            onCheckedChange={() => handleToggle(speciality)}
                            disabled={disabled}
                        />
                        <Label
                            htmlFor={`speciality-${speciality}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            {speciality}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    )
}
