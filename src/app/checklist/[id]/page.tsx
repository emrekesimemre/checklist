'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  LinearProgress,
  Alert,
  Snackbar,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  PictureAsPdf,
  FileDownload,
  ChecklistRtl,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChecklistItem } from '../../../components/ChecklistItem';
import { useChecklistStore } from '../../../store/checklist-store';
import {
  generateChecklistPDF,
  downloadPDFSummary,
} from '../../../utils/pdf-generator';

interface ChecklistDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ChecklistDetailPage({
  params,
}: ChecklistDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  const {
    currentChecklist,
    setCurrentChecklist,
    addItem,
    getChecklistProgress,
    updateChecklistNotes,
  } = useChecklistStore();

  const handleExportPDF = useCallback(async () => {
    if (!currentChecklist) return;

    setIsGeneratingPDF(true);
    try {
      await generateChecklistPDF(currentChecklist, 'checklist-content');
      setSnackbar({
        open: true,
        message: 'PDF başarıyla oluşturuldu!',
        severity: 'success',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      setSnackbar({
        open: true,
        message: 'PDF oluşturulurken hata oluştu!',
        severity: 'error',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [currentChecklist]);

  useEffect(() => {
    setCurrentChecklist(id);
  }, [id, setCurrentChecklist]);

  useEffect(() => {
    // Check if PDF export was requested
    if (searchParams.get('export') === 'pdf' && currentChecklist) {
      handleExportPDF();
    }
  }, [searchParams, currentChecklist, handleExportPDF]);

  useEffect(() => {
    if (currentChecklist) {
      setNotesValue(currentChecklist.notes || '');
    }
  }, [currentChecklist]);

  const handleAddItem = () => {
    if (newItemTitle.trim() && currentChecklist) {
      addItem(
        currentChecklist.id,
        newItemTitle.trim(),
        newItemDescription.trim() || undefined
      );
      setNewItemTitle('');
      setNewItemDescription('');
      setIsAddItemDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Madde başarıyla eklendi!',
        severity: 'success',
      });
    }
  };

  const handleSaveNotes = () => {
    if (currentChecklist) {
      updateChecklistNotes(currentChecklist.id, notesValue);
      setIsEditingNotes(false);
      setSnackbar({
        open: true,
        message: 'Notlar başarıyla kaydedildi!',
        severity: 'success',
      });
    }
  };

  const handleCancelNotes = () => {
    setNotesValue(currentChecklist?.notes || '');
    setIsEditingNotes(false);
  };

  const handleDownloadSummary = () => {
    if (!currentChecklist) return;

    try {
      downloadPDFSummary(currentChecklist);
      setSnackbar({
        open: true,
        message: 'Özet dosyası indirildi!',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Özet dosyası indirilemedi!',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!currentChecklist) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Checklist bulunamadı. Lütfen ana sayfaya dönün.
        </Alert>
      </Container>
    );
  }

  const progress = getChecklistProgress(currentChecklist.id);
  const progressPercentage =
    progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
  const isCompleted = progressPercentage === 100;

  return (
    <>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <ChecklistRtl sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {currentChecklist.title}
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              color="inherit"
              startIcon={<FileDownload />}
              onClick={handleDownloadSummary}
              size="small"
            >
              Özet
            </Button>
            <Button
              color="inherit"
              startIcon={<PictureAsPdf />}
              onClick={handleExportPDF}
              disabled={isGeneratingPDF || progress.total === 0}
              size="small"
            >
              {isGeneratingPDF ? 'Oluşturuluyor...' : 'PDF'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Checklist Header */}
        <Paper sx={{ p: 3, mb: 3 }} id="checklist-content">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
          >
            <Box flex={1}>
              <Typography variant="h4" gutterBottom>
                {currentChecklist.title}
              </Typography>
              {currentChecklist.description && (
                <Typography variant="body1" color="text.secondary" paragraph>
                  {currentChecklist.description}
                </Typography>
              )}
            </Box>
            <Box
              display="flex"
              gap={1}
              flexWrap="wrap"
              justifyContent="flex-end"
              data-pdf-hide
            >
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setIsAddItemDialogOpen(true)}
                sx={{
                  display: { xs: 'none', md: 'block' },
                }}
              >
                Madde Ekle
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Progress Section */}
          <Box mb={3}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="h6">
                İlerleme: {progress.completed}/{progress.total}
              </Typography>
              <Chip
                label={isCompleted ? 'Tamamlandı' : 'Devam Ediyor'}
                color={isCompleted ? 'success' : 'warning'}
                variant="outlined"
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              %{Math.round(progressPercentage)} tamamlandı
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Items Section */}
          <Typography variant="h6" gutterBottom>
            Checklist Maddeleri
          </Typography>

          {currentChecklist.items.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight="200px"
              textAlign="center"
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Henüz hiç madde eklenmemiş
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Bu checklist&apos;e madde ekleyerek başlayın
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setIsAddItemDialogOpen(true)}
              >
                İlk Maddeyi Ekle
              </Button>
            </Box>
          ) : (
            <Box>
              {currentChecklist.items.map((item, index) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  index={index}
                  checklistId={currentChecklist.id}
                />
              ))}
            </Box>
          )}

          {/* Notes Section - Now inside the PDF content area */}
          <Divider sx={{ my: 3 }} />
          <Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Genel Notlar ve Açıklamalar</Typography>
              {!isEditingNotes && (
                <IconButton
                  onClick={() => setIsEditingNotes(true)}
                  size="small"
                  data-pdf-hide
                >
                  <Edit />
                </IconButton>
              )}
            </Box>

            {isEditingNotes ? (
              <Box data-pdf-hide>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Bu checklist ile ilgili genel notlarınızı, önemli açıklamalarınızı veya sonuçlarınızı buraya yazabilirsiniz..."
                  sx={{ mb: 2 }}
                />
                <Box display="flex" gap={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancelNotes}
                  >
                    İptal
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveNotes}
                  >
                    Kaydet
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                {currentChecklist.notes ? (
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      minHeight: '60px',
                      p: 2,
                      backgroundColor: 'grey.50',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    {currentChecklist.notes}
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      minHeight: '60px',
                      p: 2,
                      backgroundColor: 'grey.50',
                      borderRadius: 1,
                      border: '1px dashed',
                      borderColor: 'grey.300',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    data-pdf-hide
                  >
                    <Typography variant="body2" color="text.secondary">
                      Henüz not eklenmemiş. Genel notlar eklemek için düzenle
                      butonuna tıklayın.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Footer Info */}
          <Divider sx={{ my: 3 }} />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="caption" color="text.secondary">
              Oluşturulma:{' '}
              {new Date(currentChecklist.createdAt).toLocaleDateString('tr-TR')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Son güncelleme:{' '}
              {new Date(currentChecklist.updatedAt).toLocaleDateString('tr-TR')}
            </Typography>
          </Box>
        </Paper>

        {/* Floating Action Button for mobile */}
        <Fab
          color="primary"
          aria-label="add item"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' },
          }}
          onClick={() => setIsAddItemDialogOpen(true)}
        >
          <Add />
        </Fab>
      </Container>

      {/* Add Item Dialog */}
      <Dialog
        open={isAddItemDialogOpen}
        onClose={() => setIsAddItemDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Yeni Madde Ekle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Madde Başlığı"
            fullWidth
            variant="outlined"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="Örn: Şantiye ilerleme durumu iş programına göre uygun mu?"
          />
          <TextField
            margin="dense"
            label="Açıklama (Opsiyonel)"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
            placeholder="Bu madde hakkında detaylı bilgi..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddItemDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleAddItem}
            variant="contained"
            disabled={!newItemTitle.trim()}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay for PDF */}
      {isGeneratingPDF && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0,0,0,0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
        >
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              PDF Oluşturuluyor...
            </Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </Paper>
        </Box>
      )}

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
    </>
  );
}
