import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Edit Business Profile',
    description: 'Update your Medixra vendor profile information.',
}

export default function VendorEditLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
