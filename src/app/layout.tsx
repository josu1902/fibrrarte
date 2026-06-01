import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import WhatsAppButton from '@/components/WhatsAppButton';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fibrarte.com.ar'),
  title: 'Fibrarte - Productos Personalizados en MDF',
  description:
    'Fibrarte: productos artesanales personalizados en MDF y fibrofácil. Souvenirs, imanes, portacelulares, llaveros y más, hechos con dedicación en Salta Capital, Argentina.',
  keywords: ['MDF', 'personalizado', 'souvenirs', 'artesanal', 'Salta', 'Argentina', 'Fibrarte'],
  authors: [{ name: 'Fibrarte' }],
  openGraph: {
    title: 'Fibrarte - Productos Personalizados en MDF',
    description: 'Productos artesanales personalizados en MDF. Hechos con dedicación en Salta, Argentina.',
    type: 'website',
    locale: 'es_AR',
    images: [{ url: '/img/logo/logo.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-body bg-cream text-brown-dark antialiased">
        {children}
        <WhatsAppButton />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#5C3D1E',
              border: '1px solid #D4A97A',
              borderRadius: '8px',
            },
          }}
        />
      </body>
    </html>
  );
}
