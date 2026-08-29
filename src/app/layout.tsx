import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Marquee from '@/components/Marquee';
import DotGrid from '@/components/DotGrid';
import ThemeToggle from '@/components/ThemeToggle';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', weight: ['400', '500', '600', '700'] });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: {
    default: 'Raja Viveka Vardhan Siluveru — Biomedical Engineering Researcher',
    template: '%s | Raja Viveka Vardhan Siluveru',
  },
  description: 'Biomedical Engineering Researcher developing label-free imaging systems, computational methods, and AI-based diagnostic tools for early disease detection. Research in autofluorescence imaging, deep learning, and non-invasive diagnostics.',
  keywords: [
    'biomedical engineering', 'oral cancer detection', 'autofluorescence imaging',
    'deep learning', 'label-free diagnostics', 'optical imaging',
    'non-invasive diagnostics', 'medical instrumentation', 'computational pathology',
    'microgravity simulation', 'FASCANet', 'AFiS-Net',
  ],
  authors: [{ name: 'Raja Viveka Vardhan Siluveru' }],
  creator: 'Raja Viveka Vardhan Siluveru',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Raja Viveka Vardhan Siluveru — Research Portfolio',
    title: 'Raja Viveka Vardhan Siluveru — Biomedical Engineering Researcher',
    description: 'Label-free imaging systems, computational methods, and AI diagnostics for early disease detection.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raja Viveka Vardhan Siluveru — Biomedical Engineering Researcher',
    description: 'Label-free imaging systems, computational methods, and AI diagnostics for early disease detection.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/mobile.css" media="(max-width: 768px)" />
      </head>
      <body suppressHydrationWarning className={`${spaceGrotesk.variable} ${jetbrains.variable} font-sans antialiased`}>
        <DotGrid />
        <ThemeToggle />
        <Marquee direction="left" sticky />
        <Navigation />
        <div className="pt-16 relative">
          {children}
          <Footer />
        </div>
        <Marquee direction="right" />
      </body>
    </html>
  );
}
