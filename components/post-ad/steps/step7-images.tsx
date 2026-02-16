import Image from 'next/image'
import { Camera, X, RefreshCw, CheckCircle2, AlertCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageState } from '../types'

const MAX_IMAGES = 8

interface Step7Props {
    images: ImageState[]
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemoveImage: (id: string) => void
    onRetryImage: (id: string) => void
    onNext: () => void
    onBack: () => void
    formLoading: boolean
}

export function Step7Images({ images, onImageUpload, onRemoveImage, onRetryImage, onNext, onBack, formLoading }: Step7Props) {
    const uploadingCount = images.filter(img => img.status === 'uploading' || img.status === 'waiting').length
    const completeCount = images.filter(img => img.status === 'complete').length
    const errorCount = images.filter(img => img.status === 'error').length
    const isUploading = uploadingCount > 0

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-xl font-semibold">Upload Photos</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Add up to {MAX_IMAGES} photos. First image will be the cover photo.
                </p>
            </div>

            {images.length < MAX_IMAGES && (
                <label className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer w-full">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">Click to upload or drag and drop</h3>
                    <p className="text-xs text-muted-foreground">JPG, PNG or WebP (max 10MB each, auto-compressed)</p>
                    <input type="file" className="hidden" multiple accept="image/jpeg,image/png,image/webp" onChange={onImageUpload} disabled={formLoading || isUploading} />
                </label>
            )}

            {/* Upload Status Bar */}
            {images.length > 0 && (
                <div className="flex items-center gap-4 text-sm flex-wrap">
                    <span className="text-muted-foreground">{images.length}/{MAX_IMAGES} photos</span>
                    {isUploading && (
                        <span className="flex items-center gap-1.5 text-blue-600">
                            <Upload className="h-3.5 w-3.5 animate-pulse" />
                            Uploading {uploadingCount}...
                        </span>
                    )}
                    {completeCount > 0 && (
                        <span className="flex items-center gap-1.5 text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {completeCount} uploaded
                        </span>
                    )}
                    {errorCount > 0 && (
                        <span className="flex items-center gap-1.5 text-destructive">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errorCount} failed
                        </span>
                    )}
                </div>
            )}

            {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {images.map((img, index) => (
                        <div key={img.id} className="relative aspect-square bg-muted rounded-lg border border-border overflow-hidden group">
                            {/* Cover Badge */}
                            {index === 0 && (
                                <span className="absolute top-1 left-1 z-10 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                                    Cover
                                </span>
                            )}

                            <Image
                                src={img.preview}
                                alt="Preview"
                                fill
                                className={`object-cover transition-all duration-300 ${
                                    img.status === 'uploading' || img.status === 'waiting'
                                        ? 'grayscale opacity-50'
                                        : img.status === 'error'
                                        ? 'opacity-40'
                                        : ''
                                }`}
                            />

                            {/* Uploading Spinner */}
                            {(img.status === 'uploading' || img.status === 'waiting') && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                                </div>
                            )}

                            {/* Success Checkmark */}
                            {img.status === 'complete' && (
                                <div className="absolute bottom-1 left-1">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 drop-shadow" />
                                </div>
                            )}

                            {/* Error + Retry */}
                            {img.status === 'error' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/30">
                                    <span className="text-[10px] text-white font-medium bg-destructive/90 px-2 py-0.5 rounded max-w-[90%] truncate">
                                        {img.error || 'Failed'}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRetryImage(img.id) }}
                                        className="flex items-center gap-1 text-[10px] text-white bg-primary/90 hover:bg-primary px-2 py-0.5 rounded transition-colors"
                                        type="button"
                                    >
                                        <RefreshCw className="h-2.5 w-2.5" />
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Remove Button */}
                            <button
                                onClick={() => onRemoveImage(img.id)}
                                className="absolute top-1 right-1 bg-black/50 hover:bg-destructive text-white rounded-full p-1 opacity-100 transition-opacity"
                                type="button"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={formLoading}>Back</Button>
                <Button
                    onClick={onNext}
                    disabled={formLoading || isUploading}
                    title={isUploading ? 'Wait for uploads to complete' : undefined}
                >
                    {isUploading ? 'Uploading...' : 'Next'}
                </Button>
            </div>
        </div>
    )
}
