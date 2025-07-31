'use client';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from '../theme/theme';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
