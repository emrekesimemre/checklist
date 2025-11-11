'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  Assessment,
  Delete,
  PictureAsPdf,
} from '@mui/icons-material';
import Link from 'next/link';
import { useEvaluationStore } from '../../store/evaluation-store';
import { generateReportsPDF } from '../../utils/pdf-generator';

export default function ReportsPage() {
  const {
    degerlendirmeler,
    projeFirmalari,
    fetchDegerlendirmeler,
    fetchProjeFirmalari,
    deleteDegerlendirme,
    loadingDegerlendirmeler,
    loadingProjeFirmalari,
  } = useEvaluationStore();

  const [selectedYil, setSelectedYil] = useState<number | 'all'>('all');
  const [selectedFirma, setSelectedFirma] = useState<string | 'all'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // İlk yüklemede verileri getir
  useEffect(() => {
    fetchProjeFirmalari();
    fetchDegerlendirmeler();
  }, [fetchProjeFirmalari, fetchDegerlendirmeler]);

  // Filtreler değiştiğinde verileri yeniden getir
  useEffect(() => {
    const yil = selectedYil !== 'all' ? selectedYil : undefined;
    const firmaId = selectedFirma !== 'all' ? selectedFirma : undefined;
    const start = startDate || undefined;
    const end = endDate || undefined;
    fetchDegerlendirmeler(yil, firmaId, start, end);
  }, [selectedYil, selectedFirma, startDate, endDate, fetchDegerlendirmeler]);

  // Mevcut yılları al
  const yillar = useMemo(() => {
    const years = new Set(
      degerlendirmeler.map((d) => d.yil).sort((a, b) => b - a)
    );
    return Array.from(years);
  }, [degerlendirmeler]);

  // Filtrelenmiş değerlendirmeler
  const filteredDegerlendirmeler = useMemo(() => {
    let filtered = [...degerlendirmeler];

    if (selectedYil !== 'all') {
      filtered = filtered.filter((d) => d.yil === selectedYil);
    }

    if (selectedFirma !== 'all') {
      filtered = filtered.filter((d) => d.projeFirmasiId === selectedFirma);
    }

    // Tarih aralığı filtresi (client-side, API'den zaten filtrelenmiş olsa da)
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((d) => d.createdAt >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((d) => d.createdAt <= end);
    }

    return filtered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [degerlendirmeler, selectedYil, selectedFirma, startDate, endDate]);

  // Yıllık özet istatistikler
  const yillikOzet = useMemo(() => {
    if (selectedYil === 'all') return null;

    const yilDegerlendirmeler = degerlendirmeler.filter(
      (d) => d.yil === selectedYil
    );

    const firmaMap = new Map<
      string,
      { name: string; puanlar: number[]; count: number }
    >();

    yilDegerlendirmeler.forEach((d) => {
      const existing = firmaMap.get(d.projeFirmasiId);
      if (existing) {
        existing.puanlar.push(d.toplamPuan);
        existing.count++;
      } else {
        firmaMap.set(d.projeFirmasiId, {
          name: d.projeFirmasiName,
          puanlar: [d.toplamPuan],
          count: 1,
        });
      }
    });

    return Array.from(firmaMap.entries())
      .map(([firmaId, data]) => ({
        firmaId,
        firmaName: data.name,
        ortalamaPuan:
          data.puanlar.reduce((sum, p) => sum + p, 0) / data.puanlar.length,
        degerlendirmeSayisi: data.count,
      }))
      .sort((a, b) => b.ortalamaPuan - a.ortalamaPuan);
  }, [degerlendirmeler, selectedYil]);

  // Yıllık özet için genel ortalama puan
  const yillikGenelOrtalama = useMemo(() => {
    if (selectedYil === 'all' || !yillikOzet || yillikOzet.length === 0)
      return null;
    const toplamPuan = yillikOzet.reduce(
      (sum, ozet) => sum + ozet.ortalamaPuan * ozet.degerlendirmeSayisi,
      0
    );
    const toplamSayi = yillikOzet.reduce(
      (sum, ozet) => sum + ozet.degerlendirmeSayisi,
      0
    );
    return toplamSayi > 0 ? toplamPuan / toplamSayi : 0;
  }, [yillikOzet, selectedYil]);

  // Filtrelenmiş değerlendirmeler için genel ortalama puan
  const genelOrtalamaPuan = useMemo(() => {
    if (filteredDegerlendirmeler.length === 0) return null;
    const toplam = filteredDegerlendirmeler.reduce(
      (sum, d) => sum + d.toplamPuan,
      0
    );
    return toplam / filteredDegerlendirmeler.length;
  }, [filteredDegerlendirmeler]);

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      await deleteDegerlendirme(deletingId);
      // Verileri yeniden getir
      const yil = selectedYil !== 'all' ? selectedYil : undefined;
      const firmaId = selectedFirma !== 'all' ? selectedFirma : undefined;
      const start = startDate || undefined;
      const end = endDate || undefined;
      await fetchDegerlendirmeler(yil, firmaId, start, end);
      setSnackbar({
        open: true,
        message: 'Değerlendirme başarıyla silindi!',
        severity: 'success',
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Değerlendirme silinirken hata oluştu!';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const selectedFirmaName =
        selectedFirma !== 'all' && selectedFirma
          ? projeFirmalari.find((f) => f.id === selectedFirma)?.name
          : undefined;

      await generateReportsPDF({
        degerlendirmeler: filteredDegerlendirmeler,
        yillikOzet: yillikOzet || null,
        yillikGenelOrtalama: yillikGenelOrtalama || null,
        genelOrtalamaPuan: genelOrtalamaPuan || null,
        selectedYil,
        selectedFirma,
        selectedFirmaName,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        projeFirmalari,
      });

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
  };

  return (
    <Box>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
          </Link>
          <Assessment sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Değerlendirme Raporları
          </Typography>
          <Button
            color="inherit"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPDF}
            disabled={isGeneratingPDF || filteredDegerlendirmeler.length === 0}
            size="small"
          >
            {isGeneratingPDF ? 'Oluşturuluyor...' : 'PDF İndir'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Değerlendirme Raporları
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Geçmiş değerlendirmeleri görüntüleyin ve analiz edin
          </Typography>
        </Box>

        {/* Filtreler */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Yıl</InputLabel>
              <Select
                value={selectedYil}
                label="Yıl"
                onChange={(e) =>
                  setSelectedYil(e.target.value as number | 'all')
                }
              >
                <MenuItem value="all">Tüm Yıllar</MenuItem>
                {yillar.map((yil) => (
                  <MenuItem key={yil} value={yil}>
                    {yil}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {loadingProjeFirmalari ? (
              <Skeleton variant="rectangular" height={56} />
            ) : (
              <FormControl fullWidth>
                <InputLabel>Proje Firması</InputLabel>
                <Select
                  value={selectedFirma}
                  label="Proje Firması"
                  onChange={(e) =>
                    setSelectedFirma(e.target.value as string | 'all')
                  }
                >
                  <MenuItem value="all">Tüm Firmalar</MenuItem>
                  {projeFirmalari.map((firma) => (
                    <MenuItem key={firma.id} value={firma.id}>
                      {firma.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              fullWidth
              label="Başlangıç Tarihi"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="Bitiş Tarihi"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          {(startDate || endDate) && (
            <Box mt={2}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Tarih Filtresini Temizle
              </Button>
            </Box>
          )}
        </Paper>

        {/* Yıllık Özet */}
        {loadingDegerlendirmeler ? (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Firma Adı</TableCell>
                      <TableCell align="right">Değerlendirme Sayısı</TableCell>
                      <TableCell align="right">Ortalama Puan</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={`skeleton-ozet-${index}`}>
                        <TableCell>
                          <Skeleton variant="text" width="80%" />
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton
                            variant="text"
                            width={40}
                            sx={{ ml: 'auto' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton
                            variant="rectangular"
                            width={60}
                            height={24}
                            sx={{ ml: 'auto', borderRadius: 1 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ) : (
          selectedYil !== 'all' &&
          yillikOzet &&
          yillikOzet.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedYil} Yılı Özeti - Proje Firmalarına Verilen Puanlar
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Firma Adı</TableCell>
                        <TableCell align="right">
                          Değerlendirme Sayısı
                        </TableCell>
                        <TableCell align="right">Ortalama Puan</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {yillikOzet.map((ozet) => (
                        <TableRow key={ozet.firmaId}>
                          <TableCell>{ozet.firmaName}</TableCell>
                          <TableCell align="right">
                            {ozet.degerlendirmeSayisi}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={ozet.ortalamaPuan.toFixed(2)}
                              color={
                                ozet.ortalamaPuan >= 8
                                  ? 'success'
                                  : ozet.ortalamaPuan >= 6
                                  ? 'warning'
                                  : 'error'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {yillikGenelOrtalama !== null && (
                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Genel Ortalama Puan:
                    </Typography>
                    <Chip
                      label={yillikGenelOrtalama.toFixed(2)}
                      color={
                        yillikGenelOrtalama >= 8
                          ? 'success'
                          : yillikGenelOrtalama >= 6
                          ? 'warning'
                          : 'error'
                      }
                      sx={{ fontSize: '1rem', fontWeight: 'bold', px: 2 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          )
        )}

        {/* Değerlendirmeler Listesi */}
        <Paper elevation={2}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              {loadingDegerlendirmeler ? (
                <Skeleton variant="text" width={200} />
              ) : (
                `Değerlendirmeler (${filteredDegerlendirmeler.length})`
              )}
            </Typography>
          </Box>
          {loadingDegerlendirmeler ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>İşin Adı</TableCell>
                    <TableCell>Proje Firması</TableCell>
                    <TableCell align="right">Yıl</TableCell>
                    <TableCell align="right">Tarih</TableCell>
                    <TableCell align="right">Toplam Puan</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton variant="text" width="80%" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width="70%" />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton
                          variant="text"
                          width={30}
                          sx={{ ml: 'auto' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton
                          variant="text"
                          width={60}
                          sx={{ ml: 'auto' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={24}
                          sx={{ ml: 'auto', borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton variant="circular" width={32} height={32} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : filteredDegerlendirmeler.length === 0 ? (
            <Box p={4} textAlign="center">
              <Alert severity="info">
                Seçilen kriterlere uygun değerlendirme bulunamadı.
              </Alert>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>İşin Adı</TableCell>
                    <TableCell>Proje Firması</TableCell>
                    <TableCell align="right">Yıl</TableCell>
                    <TableCell align="right">Tarih</TableCell>
                    <TableCell align="right">Toplam Puan</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDegerlendirmeler.map((degerlendirme) => (
                    <TableRow key={degerlendirme.id} hover>
                      <TableCell>{degerlendirme.isAdi}</TableCell>
                      <TableCell>{degerlendirme.projeFirmasiName}</TableCell>
                      <TableCell align="right">{degerlendirme.yil}</TableCell>
                      <TableCell align="right">
                        {formatDate(degerlendirme.createdAt)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={degerlendirme.toplamPuan.toFixed(2)}
                          color={
                            degerlendirme.toplamPuan >= 8
                              ? 'success'
                              : degerlendirme.toplamPuan >= 6
                              ? 'warning'
                              : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(degerlendirme.id)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {!loadingDegerlendirmeler &&
            genelOrtalamaPuan !== null &&
            filteredDegerlendirmeler.length > 0 && (
              <Box
                sx={{
                  p: 3,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'grey.50',
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Genel Ortalama Puan:
                </Typography>
                <Chip
                  label={genelOrtalamaPuan.toFixed(2)}
                  color={
                    genelOrtalamaPuan >= 8
                      ? 'success'
                      : genelOrtalamaPuan >= 6
                      ? 'warning'
                      : 'error'
                  }
                  sx={{ fontSize: '1.1rem', fontWeight: 'bold', px: 2 }}
                />
              </Box>
            )}
        </Paper>

        {/* Detaylı Görünüm için bir değerlendirme seçildiğinde gösterilebilir */}
        {/*  {filteredDegerlendirmeler.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Detaylı Görünüm
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Detaylı görünüm özelliği yakında eklenecektir.
            </Alert>
          </Box>
        )} */}
      </Container>

      {/* Silme Onay Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingId(null);
        }}
      >
        <DialogTitle>Değerlendirmeyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu değerlendirmeyi silmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeletingId(null);
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleDeleteConfirm}
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
