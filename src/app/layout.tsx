'use client';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { theme } from '../theme/theme';
import Footer from '../components/footer';
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration';
import PWAMeta from '../components/PWAMeta';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <PWAMeta />
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <Box sx={{ flex: 1 }}>{children}</Box>
            <Footer />
          </Box>
          <Analytics />
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
