import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'
import { AdFormData } from '../types'

interface Step4Props {
    formData: AdFormData
    updateFormData: (data: Partial<AdFormData>) => void
    onNext: () => void
    onBack: () => void
    formLoading: boolean
}

export function Step4Regulatory({ formData, updateFormData, onNext, onBack, formLoading }: Step4Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold">Regulatory & Compliance</h2>
            <div className="space-y-4">
                <div className="p-4 border rounded-xl bg-muted/20 space-y-4">
                    <h3 className="font-medium text-sm">Certifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { key: 'ceCertified', label: 'CE Certified' },
                            { key: 'fdaApproved', label: 'FDA Approved' },
                            { key: 'isoCertified', label: 'ISO Certified' },
                            { key: 'drapRegistered', label: 'DRAP Registered (Pakistan)' },
                        ].map((item) => (
                            <label key={item.key} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={(formData as any)[item.key]}
                                    onChange={e => updateFormData({ [item.key]: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm">{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <FormField label="Other Certifications">
                    <Input
                        value={formData.otherCertifications}
                        onChange={e => updateFormData({ otherCertifications: e.target.value })}
                        placeholder="e.g. UL, TUV, etc."
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
