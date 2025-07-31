import { Box, Stack, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
        textAlign: 'center',
      }}
    >
      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Checklist Uygulaması ·{' '}
          <Link
            href="https://github.com/emrekesimemre"
            underline="hover"
            target="_blank"
            rel="noopener"
          >
            Emre KESIM
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
};

export default Footer;
