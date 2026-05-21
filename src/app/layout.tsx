import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-body bg-cream text-brown-dark antialiased">
        {children}
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
