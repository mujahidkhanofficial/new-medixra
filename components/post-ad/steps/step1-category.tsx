import { EQUIPMENT_HIERARCHY } from '@/lib/constants'
import { AdFormData } from '../types'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Step1Props {
    formData: AdFormData
    updateFormData: (data: Partial<AdFormData>) => void
    onNext: () => void
}

export function Step1Category({ formData, updateFormData, onNext }: Step1Props) {
    const toggleCategory = (catName: string) => {
        const currentCats = formData.category || []
        if (currentCats.includes(catName)) {
            updateFormData({ category: currentCats.filter(c => c !== catName) })
        } else {
            updateFormData({ category: [...currentCats, catName] })
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-2">Core Identity: Choose Speciality</h2>
            <p className="text-sm text-muted-foreground mb-4">Select one or more specialities that apply to your equipment.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {EQUIPMENT_HIERARCHY.map((def) => {
                    const catName = def.name
                    const IconComponent = (LucideIcons as any)[def.icon] || LucideIcons.Layers
                    const isSelected = formData.category?.includes(catName)

                    return (
                        <button
                            key={catName}
                            type="button"
                            onClick={() => toggleCategory(catName)}
                            className={`relative p-4 flex flex-col items-center justify-center gap-3 rounded-xl border transition-all hover:border-primary hover:bg-primary/5 min-h-[120px]
                                ${isSelected ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card'}
                            `}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 text-primary">
                                    <CheckCircle2 className="w-5 h-5 fill-primary text-primary-foreground" />
                                </div>
                            )}
                            <div className={`h-10 w-10 flex items-center justify-center rounded-full ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <IconComponent className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <span className="font-medium text-xs text-center leading-tight">{catName}</span>
                        </button>
                    )
                })}
            </div>

            <div className="flex justify-end pt-6 border-t mt-6">
                <Button
                    onClick={onNext}
                    disabled={!formData.category || formData.category.length === 0}
                    size="lg"
                    className="w-full sm:w-auto"
                >
                    Next Step <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}

