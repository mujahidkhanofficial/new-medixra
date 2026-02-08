import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4">
            <div className="mb-6 rounded-full bg-muted p-4">
                <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">Page Not Found</h1>
            <p className="mb-8 text-muted-foreground max-w-[500px]">
                Sorry, we couldn't find the page you're looking for. It might have been removed, verified, or is temporarily unavailable.
            </p>
            <div className="flex gap-4">
                <Button asChild>
                    <Link href="/">Return Home</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/products">Browse Equipment</Link>
                </Button>
            </div>
        </div>
    )
}
