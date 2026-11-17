import './globals.css';

export const metadata = {
  title: 'SiteForge — No-Code Website Builder & Publishing Platform',
  description:
    'Drag-and-drop visual website builder with one-click publishing, FTP deployment and a self-service monetisation flow.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
