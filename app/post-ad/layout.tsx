import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Post an Ad',
    description: 'Post a new medical equipment listing to the Medixra marketplace.',
}

export default function PostAdLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
