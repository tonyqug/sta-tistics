import './globals.css'
import { Outfit } from 'next/font/google'
import {ClassProvider} from './context/classContext'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
})

export const metadata = {
  title: 'QueryDeck',
  description: 'By Students for Students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={outfit.className}>
      <body>
        <ClassProvider>
          {children}
        </ClassProvider>
      </body>
    </html>
  )

  
}
