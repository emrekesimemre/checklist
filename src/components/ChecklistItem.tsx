import React, { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Chip,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { PhotoCamera, Delete, Close, ZoomIn } from '@mui/icons-material';
import {
  ChecklistItem as ChecklistItemType,
  ChecklistStatus,
} from '../types/checklist';
import { useChecklistStore } from '../store/checklist-store';

interface ChecklistItemProps {
  item: ChecklistItemType;
  checklistId: string;
  readOnly?: boolean;
  index: number;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  item,
  checklistId,
  readOnly = false,
  index,
}) => {
  const [reason, setReason] = useState(item.reason || '');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    updateItemStatus,
    updateItemReason,
    addImageToItem,
    removeImageFromItem,
    deleteItem,
  } = useChecklistStore();

  const handleStatusChange = (newStatus: ChecklistStatus) => {
    updateItemStatus(checklistId, item.id, newStatus);
    if (newStatus === 'completed') {
      setReason('');
      updateItemReason(checklistId, item.id, '');
    }
  };

  const handleReasonChange = (newReason: string) => {
    setReason(newReason);
    updateItemReason(checklistId, item.id, newReason);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          await addImageToItem(checklistId, item.id, file);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageId: string) => {
    removeImageFromItem(checklistId, item.id, imageId);
  };

  const getStatusColor = ():
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (item.status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'not-started':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = () => {
    switch (item.status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in-progress':
        return 'Devam Ediyor';
      case 'not-started':
        return 'Başlanmadı';
      default:
        return 'Başlanmadı';
    }
  };

  const showReasonField =
    item.status !== 'completed' && item.status !== 'not-started';
  const showImageUpload = !readOnly && item.status !== 'not-started';

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
          >
            <Box flex={1}>
              <Typography variant="h6" gutterBottom>
                {index + 1}. {item.title}
              </Typography>
              {item.description && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.description}
                </Typography>
              )}
            </Box>
            {!readOnly && (
              <IconButton
                color="error"
                onClick={() => deleteItem(checklistId, item.id)}
                size="small"
              >
                <Delete />
              </IconButton>
            )}
          </Box>

          <Box mb={2}>
            <Chip
              label={getStatusLabel()}
              color={getStatusColor()}
              variant="outlined"
              size="small"
            />
          </Box>

          {!readOnly && (
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Durum</InputLabel>
              <Select
                value={item.status}
                label="Durum"
                onChange={(e) =>
                  handleStatusChange(e.target.value as ChecklistStatus)
                }
              >
                <MenuItem value="not-started">Başlanmadı</MenuItem>
                <MenuItem value="in-progress">Devam Ediyor</MenuItem>
                <MenuItem value="completed">Tamamlandı</MenuItem>
              </Select>
            </FormControl>
          )}

          {showReasonField && (
            <TextField
              fullWidth
              margin="normal"
              size="small"
              label="Neden tamamlanamadı?"
              multiline
              rows={2}
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              disabled={readOnly}
              helperText="Bu maddenin neden henüz tamamlanamadığını açıklayın"
            />
          )}

          {item.reason && readOnly && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Neden:</strong> {item.reason}
              </Typography>
            </Alert>
          )}

          {showImageUpload && (
            <Box mt={2}>
              <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={() => fileInputRef.current?.click()}
                size="small"
              >
                Görsel Ekle
              </Button>
            </Box>
          )}

          {item.images && item.images.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Görseller:
              </Typography>
              <ImageList
                variant="quilted"
                cols={item.images.length == 1 ? 1 : 2}
                rowHeight={120}
              >
                {item.images.map((image) => (
                  <ImageListItem key={image.id}>
                    <Box
                      sx={{
                        width: '100%',
                        height: '120px',
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedImage(image.url)}
                    >
                      <Image
                        src={image.url}
                        alt={image.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </Box>
                    <ImageListItemBar
                      actionIcon={
                        <Box>
                          <IconButton
                            sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                            onClick={() => setSelectedImage(image.url)}
                          >
                            <ZoomIn />
                          </IconButton>
                          {!readOnly && (
                            <IconButton
                              sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                              onClick={() => handleRemoveImage(image.id)}
                            >
                              <Close />
                            </IconButton>
                          )}
                        </Box>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={2}
          >
            Son güncelleme: {new Date(item.updatedAt).toLocaleString('tr-TR')}
          </Typography>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {selectedImage && (
            <Box sx={{ position: 'relative', width: '100%', height: '60vh' }}>
              <Image
                src={selectedImage}
                alt="Büyütülmüş görsel"
                fill
                style={{ objectFit: 'contain' }}
                sizes="90vw"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedImage(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
