import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Create Account',
    description: 'Join Pakmedinex as a User, Vendor, or Engineer to buy and sell medical equipment.',
}

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
