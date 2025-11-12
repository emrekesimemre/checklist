'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Autocomplete,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  Chip,
  Stack,
  Select,
  MenuItem,
  Skeleton,
} from '@mui/material';
import { Add, Edit, Delete, Save } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useEvaluationStore } from '../../store/evaluation-store';
import { Konu, Puan, ProjeFirmasi } from '../../types/evaluation';

export default function EvaluationPage() {
  const router = useRouter();
  const {
    projeFirmalari,
    konular,
    fetchProjeFirmalari,
    fetchKonular,
    addProjeFirmasi,
    updateProjeFirmasi,
    deleteProjeFirmasi,
    addKonu,
    updateKonu,
    deleteKonu,
    createDegerlendirme,
    loadingProjeFirmalari,
    loadingKonular,
  } = useEvaluationStore();

  // İlk yüklemede verileri getir
  useEffect(() => {
    fetchProjeFirmalari();
    fetchKonular();
  }, [fetchProjeFirmalari, fetchKonular]);

  const [isAdi, setIsAdi] = useState('');
  const [selectedFirma, setSelectedFirma] = useState<string | null>(null);
  const [puanlar, setPuanlar] = useState<Map<string, number>>(new Map());
  const [notlar, setNotlar] = useState('');

  // Konu yönetimi
  const [isKonuDialogOpen, setIsKonuDialogOpen] = useState(false);
  const [editingKonu, setEditingKonu] = useState<Konu | null>(null);
  const [konuTitle, setKonuTitle] = useState('');
  const [deleteKonuDialogOpen, setDeleteKonuDialogOpen] = useState(false);
  const [deletingKonuId, setDeletingKonuId] = useState<string | null>(null);

  // Firma yönetimi
  const [isFirmaDialogOpen, setIsFirmaDialogOpen] = useState(false);
  const [editingFirma, setEditingFirma] = useState<ProjeFirmasi | null>(null);
  const [firmaName, setFirmaName] = useState('');
  const [deleteFirmaDialogOpen, setDeleteFirmaDialogOpen] = useState(false);
  const [deletingFirmaId, setDeletingFirmaId] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Konular değiştiğinde puanlar map'ini güncelle
  useEffect(() => {
    setPuanlar((prevPuanlar) => {
      const newPuanlar = new Map(prevPuanlar);
      konular.forEach((konu) => {
        if (!newPuanlar.has(konu.id)) {
          newPuanlar.set(konu.id, 0);
        }
      });
      // Silinen konuların puanlarını temizle
      const konuIds = new Set(konular.map((k) => k.id));
      Array.from(newPuanlar.keys()).forEach((id) => {
        if (!konuIds.has(id)) {
          newPuanlar.delete(id);
        }
      });
      return newPuanlar;
    });
  }, [konular]);

  const handlePuanChange = (konuId: string, value: number) => {
    setPuanlar(new Map(puanlar.set(konuId, value)));
  };

  const handleAddKonu = () => {
    setEditingKonu(null);
    setKonuTitle('');
    setIsKonuDialogOpen(true);
  };

  const handleEditKonu = (konu: Konu) => {
    setEditingKonu(konu);
    setKonuTitle(konu.title);
    setIsKonuDialogOpen(true);
  };

  const handleSaveKonu = async () => {
    if (!konuTitle.trim()) {
      setSnackbar({
        open: true,
        message: 'Konu başlığı boş olamaz!',
        severity: 'error',
      });
      return;
    }

    try {
      if (editingKonu) {
        await updateKonu(editingKonu.id, konuTitle);
        setSnackbar({
          open: true,
          message: 'Konu güncellendi!',
          severity: 'success',
        });
      } else {
        await addKonu(konuTitle);
        setSnackbar({
          open: true,
          message: 'Konu eklendi!',
          severity: 'success',
        });
      }
      setIsKonuDialogOpen(false);
      setKonuTitle('');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Konu kaydedilirken hata oluştu!';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleDeleteKonuClick = (konuId: string) => {
    setDeletingKonuId(konuId);
    setDeleteKonuDialogOpen(true);
  };

  const handleDeleteKonuConfirm = async () => {
    if (!deletingKonuId) return;

    try {
      await deleteKonu(deletingKonuId);
      const newPuanlar = new Map(puanlar);
      newPuanlar.delete(deletingKonuId);
      setPuanlar(newPuanlar);
      setSnackbar({
        open: true,
        message: 'Konu silindi!',
        severity: 'success',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Konu silinirken hata oluştu!';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setDeleteKonuDialogOpen(false);
      setDeletingKonuId(null);
    }
  };

  const handleAddFirma = () => {
    setEditingFirma(null);
    setFirmaName('');
    setIsFirmaDialogOpen(true);
  };

  const handleEditFirma = (firma: ProjeFirmasi) => {
    setEditingFirma(firma);
    setFirmaName(firma.name);
    setIsFirmaDialogOpen(true);
  };

  const handleSaveFirma = async () => {
    if (!firmaName.trim()) {
      setSnackbar({
        open: true,
        message: 'Firma adı boş olamaz!',
        severity: 'error',
      });
      return;
    }
    try {
      if (editingFirma) {
        await updateProjeFirmasi(editingFirma.id, firmaName);
        setSnackbar({
          open: true,
          message: 'Firma güncellendi!',
          severity: 'success',
        });
      } else {
        await addProjeFirmasi(firmaName);
        const newFirma = projeFirmalari.find(
          (f) => f.name === firmaName.trim()
        );
        if (newFirma) {
          setSelectedFirma(newFirma.id);
        }
        setSnackbar({
          open: true,
          message: 'Proje firması eklendi!',
          severity: 'success',
        });
      }
      setIsFirmaDialogOpen(false);
      setFirmaName('');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : editingFirma
          ? 'Firma güncellenirken hata oluştu!'
          : 'Firma eklenirken hata oluştu!';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleDeleteFirmaClick = (firmaId: string) => {
    setDeletingFirmaId(firmaId);
    setDeleteFirmaDialogOpen(true);
  };

  const handleDeleteFirmaConfirm = async () => {
    if (!deletingFirmaId) return;

    try {
      await deleteProjeFirmasi(deletingFirmaId);
      // Eğer silinen firma seçiliyse, seçimi temizle
      if (selectedFirma === deletingFirmaId) {
        setSelectedFirma(null);
      }
      setSnackbar({
        open: true,
        message: 'Firma silindi!',
        severity: 'success',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Firma silinirken hata oluştu!';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setDeleteFirmaDialogOpen(false);
      setDeletingFirmaId(null);
    }
  };

  const handleSave = async () => {
    if (!isAdi.trim()) {
      setSnackbar({
        open: true,
        message: 'İş adı boş olamaz!',
        severity: 'error',
      });
      return;
    }

    if (!selectedFirma) {
      setSnackbar({
        open: true,
        message: 'Lütfen bir proje firması seçin!',
        severity: 'error',
      });
      return;
    }

    if (konular.length === 0) {
      setSnackbar({
        open: true,
        message: 'En az bir konu eklemelisiniz!',
        severity: 'error',
      });
      return;
    }

    const puanlarArray: Puan[] = Array.from(puanlar.entries()).map(
      ([konuId, puan]) => ({
        konuId,
        puan,
      })
    );

    try {
      await createDegerlendirme(isAdi, selectedFirma, puanlarArray, notlar);

      // Formu temizle
      setIsAdi('');
      setSelectedFirma(null);
      setPuanlar(new Map());
      setNotlar('');

      setSnackbar({
        open: true,
        message: 'Değerlendirme kaydedildi!',
        severity: 'success',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Değerlendirme kaydedilirken hata oluştu!';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const sortedKonular = [...konular].sort((a, b) => a.order - b.order);

  const toplamPuan =
    puanlar.size > 0
      ? Array.from(puanlar.values()).reduce((sum, p) => sum + p, 0) /
        puanlar.size
      : 0;

  return (
    <Box>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Mekanik Değerlendirme Formu
        </Typography>
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            TADİLAT VE DEKORASYON İŞLERİNE AİT PROJE FİRMASI DEĞERLENDİRME
            TABLOSU
          </Typography>

          <Stack spacing={3}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                label="İşin Adı"
                value={isAdi}
                onChange={(e) => setIsAdi(e.target.value)}
                fullWidth
                required
                sx={{ flex: 1, minWidth: 200 }}
              />
              {loadingProjeFirmalari ? (
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ flex: 1, minWidth: 200, borderRadius: 1 }}
                />
              ) : (
                <Autocomplete
                  options={projeFirmalari}
                  getOptionLabel={(option) => option.name}
                  value={
                    projeFirmalari.find((f) => f.id === selectedFirma) || null
                  }
                  onChange={(_, newValue) =>
                    setSelectedFirma(newValue?.id || null)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Proje Firması"
                      required
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                  )}
                  sx={{ flex: 1, minWidth: 200 }}
                  noOptionsText="Firma bulunamadı"
                />
              )}
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddFirma}
                sx={{ minWidth: 150 }}
              >
                Firma Ekle
              </Button>
            </Box>

            {/* Proje Firmaları Yönetimi */}
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Proje Firmaları</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddFirma}
                  size="small"
                >
                  Firma Ekle
                </Button>
              </Box>

              {projeFirmalari.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Henüz firma eklenmemiş. Lütfen firma ekleyin.
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell width="80%">FİRMA ADI</TableCell>
                        <TableCell width="20%">İŞLEMLER</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loadingProjeFirmalari ? (
                        Array.from({ length: 3 }).map((_, index) => (
                          <TableRow key={`skeleton-${index}`}>
                            <TableCell>
                              <Skeleton variant="text" width="80%" />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <Skeleton
                                  variant="circular"
                                  width={32}
                                  height={32}
                                />
                                <Skeleton
                                  variant="circular"
                                  width={32}
                                  height={32}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : projeFirmalari.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} align="center">
                            <Typography color="text.secondary" py={2}>
                              Henüz firma eklenmemiş
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        projeFirmalari.map((firma) => (
                          <TableRow key={firma.id}>
                            <TableCell>{firma.name}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleEditFirma(firma)}
                                color="primary"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteFirmaClick(firma.id)}
                                color="error"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Değerlendirme Konuları</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddKonu}
                  size="small"
                >
                  Konu Ekle
                </Button>
              </Box>

              {konular.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Henüz konu eklenmemiş. Lütfen konu ekleyin.
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  0-10 arası puan verilebilir.
                </Alert>
              )}

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="5%">NO</TableCell>
                      <TableCell width="45%">KONULAR</TableCell>
                      <TableCell width="40%">MEKANİK PUAN</TableCell>
                      <TableCell width="10%">İŞLEMLER</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingKonular ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell>
                            <Skeleton variant="text" width={30} />
                          </TableCell>
                          <TableCell>
                            <Skeleton variant="text" width="80%" />
                          </TableCell>
                          <TableCell>
                            <Skeleton
                              variant="rectangular"
                              width={100}
                              height={40}
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Skeleton
                                variant="circular"
                                width={32}
                                height={32}
                              />
                              <Skeleton
                                variant="circular"
                                width={32}
                                height={32}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : sortedKonular.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary" py={2}>
                            Henüz konu eklenmemiş
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedKonular.map((konu, index) => (
                        <TableRow key={konu.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{konu.title}</TableCell>
                          <TableCell>
                            <Box display="flex" justifyContent="flex-start">
                              <Select
                                value={puanlar.get(konu.id) || 0}
                                onChange={(e) =>
                                  handlePuanChange(
                                    konu.id,
                                    e.target.value as number
                                  )
                                }
                              >
                                <MenuItem value={0}>0</MenuItem>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={8}>8</MenuItem>
                                <MenuItem value={9}>9</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                              </Select>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleEditKonu(konu)}
                              color="primary"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteKonuClick(konu.id)}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box>
              <TextField
                label="Notlar (Opsiyonel)"
                value={notlar}
                onChange={(e) => setNotlar(e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={2}
              sx={{ backgroundColor: 'grey.100', borderRadius: 1 }}
            >
              <Typography variant="h6">TOPLAM KARNE PUANI</Typography>
              <Chip
                label={toplamPuan.toFixed(2)}
                color="primary"
                sx={{ fontSize: '1.2rem', fontWeight: 'bold', px: 2 }}
              />
            </Box>

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => router.push('/')}>
                İptal
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={
                  !isAdi.trim() || !selectedFirma || konular.length === 0
                }
                size="large"
              >
                Kaydet
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>

      {/* Konu Ekle/Düzenle Dialog */}
      <Dialog
        open={isKonuDialogOpen}
        onClose={() => setIsKonuDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingKonu ? 'Konu Düzenle' : 'Yeni Konu Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Konu Başlığı"
            fullWidth
            variant="outlined"
            value={konuTitle}
            onChange={(e) => setKonuTitle(e.target.value)}
            placeholder="Örn: Proje firması yerinde keşif yaptı mı?"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsKonuDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleSaveKonu}
            variant="contained"
            disabled={!konuTitle.trim()}
          >
            {editingKonu ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Firma Ekle/Düzenle Dialog */}
      <Dialog
        open={isFirmaDialogOpen}
        onClose={() => setIsFirmaDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingFirma ? 'Firma Düzenle' : 'Yeni Proje Firması Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Firma Adı"
            fullWidth
            variant="outlined"
            value={firmaName}
            onChange={(e) => setFirmaName(e.target.value)}
            placeholder="Örn: ABC İnşaat A.Ş."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsFirmaDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleSaveFirma}
            variant="contained"
            disabled={!firmaName.trim()}
          >
            {editingFirma ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Firma Silme Onay Dialog */}
      <Dialog
        open={deleteFirmaDialogOpen}
        onClose={() => {
          setDeleteFirmaDialogOpen(false);
          setDeletingFirmaId(null);
        }}
      >
        <DialogTitle>Firmayı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu firmayı silmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz. Bu firmaya ait değerlendirmeler de etkilenebilir.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteFirmaDialogOpen(false);
              setDeletingFirmaId(null);
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleDeleteFirmaConfirm}
            color="error"
            variant="contained"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Konu Silme Onay Dialog */}
      <Dialog
        open={deleteKonuDialogOpen}
        onClose={() => {
          setDeleteKonuDialogOpen(false);
          setDeletingKonuId(null);
        }}
      >
        <DialogTitle>Konuyu Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu konuyu silmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteKonuDialogOpen(false);
              setDeletingKonuId(null);
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleDeleteKonuConfirm}
            color="error"
            variant="contained"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
