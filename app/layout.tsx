import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import QueryProviders from '@/provider/query-provider';
import SheetProvider from '@/provider/sheet-provider';
import { Toaster } from '@/components/ui/sonner';

const dm_sans = DM_Sans({
  weight: ['400', '500', '700', '800', '900'],
  display: 'swap',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cashflow  Cloud',
  description: 'An modern expense tracker finance manager.',
  authors: {
    name: 'Rohit Singh',
    url: 'https://ro-rohit.github.io/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dm_sans.className} antialiased`}>
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProviders>
              <SheetProvider />
              <Toaster position="bottom-right" />
              {children}
            </QueryProviders>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
