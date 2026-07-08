import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import OpeningAnimation from '@/components/OpeningAnimation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rythm - Full Stack Developer & ML Specialist',
  description: 'Portfolio of Rythm, a Full Stack Developer and Machine Learning Specialist',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <OpeningAnimation />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}