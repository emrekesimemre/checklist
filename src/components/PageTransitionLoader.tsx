'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { ChecklistRtl } from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import { useChecklistStore } from '../store/checklist-store';
import { useEvaluationStore } from '../store/evaluation-store';

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Get loading states from stores
  const { loadingChecklists, loading } = useChecklistStore();
  const { loadingProjeFirmalari, loadingKonular, loadingDegerlendirmeler } =
    useEvaluationStore();

  // Check if any API is loading
  const isAnyApiLoading =
    loadingChecklists ||
    loading ||
    loadingProjeFirmalari ||
    loadingKonular ||
    loadingDegerlendirmeler;

  useEffect(() => {
    if (pathname !== prevPathname) {
      setIsLoading(true);
      setPrevPathname(pathname);
    }
  }, [pathname, prevPathname]);

  // Hide loading when pathname changed AND no APIs are loading
  useEffect(() => {
    if (isLoading && pathname === prevPathname && !isAnyApiLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isLoading, pathname, prevPathname, isAnyApiLoading]);

  if (!isLoading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <ChecklistRtl
          sx={{
            fontSize: 64,
            color: 'primary.main',
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
              '50%': {
                transform: 'scale(1.1)',
                opacity: 0.8,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
