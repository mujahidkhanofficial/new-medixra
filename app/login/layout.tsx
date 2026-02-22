import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Sign In',
    description: 'Login to your Medixra account.',
}

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
