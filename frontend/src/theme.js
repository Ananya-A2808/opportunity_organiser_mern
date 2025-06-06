import { createTheme } from '@mui/material/styles';

const neonBlue = '#00ffff';
const neonPurple = '#9d00ff';
const darkBackground = '#121212';
const lightGrey = '#e0e0e0';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: neonBlue,
      contrastText: '#000000',
    },
    secondary: {
      main: neonPurple,
      contrastText: '#ffffff',
    },
    background: {
      default: darkBackground,
      paper: '#1e1e1e',
    },
    text: {
      primary: lightGrey,
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: `0 0 8px ${neonBlue}`,
          '&:hover': {
            boxShadow: `0 0 16px ${neonBlue}`,
            backgroundColor: '#222222',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: `0 0 15px ${neonBlue}`,
        },
      },
    },
  },
});

export default theme;
