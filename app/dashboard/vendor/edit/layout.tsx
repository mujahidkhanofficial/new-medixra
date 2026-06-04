import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Edit Business Profile',
    description: 'Update your Pakmedinex vendor profile information.',
}

export default function VendorEditLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
