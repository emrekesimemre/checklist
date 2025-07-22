import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  LinearProgress,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  PictureAsPdf,
  Visibility,
} from '@mui/icons-material';
import { Checklist } from '../types/checklist';
import { useChecklistStore } from '../store/checklist-store';

interface ChecklistCardProps {
  checklist: Checklist;
  onView: (checklist: Checklist) => void;
  onEdit?: (checklist: Checklist) => void;
  onDelete?: (checklist: Checklist) => void;
  onExportPDF?: (checklist: Checklist) => void;
}

export const ChecklistCard: React.FC<ChecklistCardProps> = ({
  checklist,
  onView,
  onEdit,
  onDelete,
  onExportPDF,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { getChecklistProgress } = useChecklistStore();

  const isStarted = checklist.items.some(
    (item) => item.status === 'in-progress' || item.status === 'completed'
  );

  const progress = getChecklistProgress(checklist.id);
  const progressPercentage =
    progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = () => {
    if (progressPercentage === 100) return 'success';
    if (progressPercentage > 0) return 'warning';
    return 'default';
  };

  const getStatusText = () => {
    if (isStarted) return 'Devam Ediyor';
    return 'Başlanmadı';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>
            {checklist.title}
          </Typography>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            aria-label="checklist options"
          >
            <MoreVert />
          </IconButton>
        </Box>

        {checklist.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {checklist.description}
          </Typography>
        )}

        <Box mb={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="body2" color="text.secondary">
              İlerleme: {progress.completed}/{progress.total}
            </Typography>
            <Chip
              label={getStatusText()}
              size="small"
              color={
                isStarted
                  ? 'warning'
                  : (getStatusColor() as
                      | 'default'
                      | 'primary'
                      | 'secondary'
                      | 'error'
                      | 'info'
                      | 'success'
                      | 'warning')
              }
              variant="outlined"
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Typography variant="caption" color="text.secondary">
          Son güncelleme:{' '}
          {new Date(checklist.updatedAt).toLocaleDateString('tr-TR')}
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => onView(checklist)}
          variant="contained"
          fullWidth
        >
          Görüntüle
        </Button>
      </CardActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 160 },
        }}
      >
        {onEdit && (
          <MenuItem
            onClick={() => {
              onEdit(checklist);
              handleMenuClose();
            }}
          >
            <Edit sx={{ mr: 1 }} fontSize="small" />
            Düzenle
          </MenuItem>
        )}
        {onExportPDF && progress.total > 0 && (
          <MenuItem
            onClick={() => {
              onExportPDF(checklist);
              handleMenuClose();
            }}
          >
            <PictureAsPdf sx={{ mr: 1 }} fontSize="small" />
            PDF İndir
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            onClick={() => {
              onDelete(checklist);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Sil
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};
