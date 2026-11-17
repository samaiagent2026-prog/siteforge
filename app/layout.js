import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';

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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Apply the saved language before first paint so RTL users see no flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var l=localStorage.getItem('siteforge.uiLang');if(l==='ar'||l==='en'){document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';}}catch(e){}",
          }}
        />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
