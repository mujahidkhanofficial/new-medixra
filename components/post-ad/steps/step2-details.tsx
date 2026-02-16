import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { FormError } from '@/components/ui/form-error'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/error-handler'
import { AdFormData } from '../types'
import { CONDITIONS } from '@/lib/constants'

interface Step2Props {
    formData: AdFormData
    updateFormData: (data: Partial<AdFormData>) => void
    onNext: () => void
    onBack: () => void
    errors: Record<string, string>
    formLoading: boolean
    error: string | null
}

export function Step2Details({ formData, updateFormData, onNext, onBack, errors, formLoading, error }: Step2Props) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [displayPrice, setDisplayPrice] = useState<string>(formData.price ? formatDisplay(formData.price) : '')

    useEffect(() => {
        setDisplayPrice(formatDisplay(formData.price))
    }, [formData.price])

    function formatDisplay(value?: string | null) {
        if (!value) return ''
        const [intPart, decPart] = (value || '').split('.')
        const intNum = parseInt(intPart || '0', 10)
        if (isNaN(intNum)) return value || ''
        const formattedInt = intNum.toLocaleString()
        return decPart && decPart.length > 0 ? `${formattedInt}.${decPart}` : formattedInt
    }

    // Count digits + decimal characters in a string slice
    const countRawChars = (s: string) => (s.match(/[\d.]/g) || []).length




    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold">Product & Commercial Details</h2>
            {error && <FormError message={error} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Product Name" required error={errors.name} className="md:col-span-2">
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={e => updateFormData({ name: e.target.value })}
                        placeholder="e.g. Samsung Ultrasound Machine X5"
                        disabled={formLoading}
                    />
                </FormField>

                <FormField label="Model">
                    <Input
                        value={formData.model}
                        onChange={e => updateFormData({ model: e.target.value })}
                        placeholder="e.g. Logiq E9"
                        disabled={formLoading}
                    />
                </FormField>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Condition</label>
                    <div className="flex gap-3">
                        {CONDITIONS.map(c => (
                            <button
                                key={c}
                                onClick={() => updateFormData({ condition: c })}
                                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                                    ${formData.condition === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}
                                `}
                                disabled={formLoading}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Price Type">
                        <select
                            value={formData.priceType}
                            onChange={e => updateFormData({ priceType: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                            disabled={formLoading}
                        >
                            <option value="fixed">Fixed Price</option>
                            <option value="range">Price Range</option>
                            <option value="quote">Quote Only</option>
                        </select>
                    </FormField>

                    {formData.priceType !== 'quote' && (
                        <FormField label={`Price (${formData.currency})`} required error={errors.price} className="md:col-span-2">
                            <Input
                                ref={inputRef}
                                type="text"
                                inputMode="decimal"
                                value={displayPrice}
                                onFocus={() => setDisplayPrice(formatDisplay(formData.price))}
                                onChange={(e) => {
                                    const rawInput = e.target.value
                                    const selectionStart = (e.target.selectionStart ?? 0)

                                    // Store cleaned raw value (no separators)
                                    const raw = rawInput.replace(/[^\d.]/g, '')
                                    const parts = raw.split('.')
                                    const cleaned = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : raw
                                    updateFormData({ price: cleaned })

                                    // Format for display
                                    const formatted = formatDisplay(cleaned)
                                    setDisplayPrice(formatted)

                                    // Preserve caret position relative to raw characters
                                    const rawCharsLeft = countRawChars(rawInput.slice(0, selectionStart))
                                    let count = 0
                                    let pos = formatted.length
                                    for (let i = 0; i < formatted.length; i++) {
                                        if (/[\d.]/.test(formatted[i])) count++
                                        if (count >= rawCharsLeft) { pos = i + 1; break }
                                    }

                                    requestAnimationFrame(() => {
                                        const el = inputRef.current
                                        if (el && el.setSelectionRange) {
                                            const newPos = Math.min(pos, el.value.length)
                                            el.setSelectionRange(newPos, newPos)
                                        }
                                    })
                                }}
                                onBlur={() => setDisplayPrice(formatDisplay(formData.price))}
                                placeholder="0.00"
                                disabled={formLoading}
                            />
                        </FormField>
                    )}
                </div>

                <FormField label="Description" required error={errors.description} className="md:col-span-2">
                    <Textarea
                        value={formData.description}
                        onChange={e => updateFormData({ description: e.target.value })}
                        placeholder="Describe features, accessories, history... (minimum 10 characters)"
                        rows={4}
                        disabled={formLoading}
                    />
                </FormField>
            </div>
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={formLoading}>Back</Button>
                <Button onClick={onNext} disabled={formLoading}>Next</Button>
            </div>
        </div>
    )
}
