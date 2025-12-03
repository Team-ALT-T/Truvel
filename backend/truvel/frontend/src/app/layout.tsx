import { Geist, Geist_Mono } from 'next/font/google'
import { Metadata } from 'next'
import GlobalStyleWrapper from '../styles/GlobalStyleWrapper'
import QueryProvider from '../providers/QueryProvider'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Truvel',
  description: 'Styled App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <QueryProvider>
          <GlobalStyleWrapper />
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
