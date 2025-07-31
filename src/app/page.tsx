'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  AppBar,
  Toolbar,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add, ChecklistRtl } from '@mui/icons-material';
import { ChecklistCard } from '../components/ChecklistCard';
import { useChecklistStore } from '../store/checklist-store';
import { Checklist } from '../types/checklist';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistDescription, setNewChecklistDescription] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { checklists, createChecklist, deleteChecklist, setCurrentChecklist } =
    useChecklistStore();

  const handleCreateChecklist = () => {
    if (newChecklistTitle.trim()) {
      createChecklist(
        newChecklistTitle.trim(),
        newChecklistDescription.trim() || undefined
      );
      setNewChecklistTitle('');
      setNewChecklistDescription('');
      setIsCreateDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Checklist başarıyla oluşturuldu!',
        severity: 'success',
      });
    }
  };

  const handleViewChecklist = (checklist: Checklist) => {
    setCurrentChecklist(checklist.id);
    router.push(`/checklist/${checklist.id}`);
  };

  const handleDeleteChecklist = (checklist: Checklist) => {
    if (
      confirm(
        `"${checklist.title}" adlı checklist'i silmek istediğinizden emin misiniz?`
      )
    ) {
      deleteChecklist(checklist.id);
      setSnackbar({
        open: true,
        message: 'Checklist başarıyla silindi!',
        severity: 'success',
      });
    }
  };

  const handleExportPDF = async (checklist: Checklist) => {
    try {
      // Navigate to checklist page and trigger PDF export
      setCurrentChecklist(checklist.id);
      router.push(`/checklist/${checklist.id}?export=pdf`);
    } catch {
      setSnackbar({
        open: true,
        message: 'PDF export sırasında hata oluştu!',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <ChecklistRtl sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Checklist Uygulaması
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Typography variant="h4" component="h1">
            Checklist&apos;lerim
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsCreateDialogOpen(true)}
            size="large"
            sx={{
              display: { xs: 'none', md: 'block' },
            }}
          >
            Yeni Checklist
          </Button>
        </Box>

        {checklists.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="400px"
            textAlign="center"
          >
            <ChecklistRtl
              sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Henüz hiç checklist&apos;iniz yok
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Yeni bir checklist oluşturarak başlayın
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsCreateDialogOpen(true)}
            >
              İlk Checklist&apos;inizi Oluşturun
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {checklists.map((checklist) => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                onView={handleViewChecklist}
                onDelete={handleDeleteChecklist}
                onExportPDF={handleExportPDF}
              />
            ))}
          </Box>
        )}

        {/* Floating Action Button for mobile */}
        <Fab
          color="primary"
          aria-label="add checklist"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' },
          }}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Add />
        </Fab>
      </Container>

      {/* Create Checklist Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Yeni Checklist Oluştur</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Checklist Başlığı"
            fullWidth
            variant="outlined"
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            placeholder="Örn: Checklist 1"
          />
          <TextField
            margin="dense"
            label="Açıklama (Opsiyonel)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newChecklistDescription}
            onChange={(e) => setNewChecklistDescription(e.target.value)}
            placeholder="Bu checklist hakkında kısa bir açıklama yazın..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleCreateChecklist}
            variant="contained"
            disabled={!newChecklistTitle.trim()}
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
