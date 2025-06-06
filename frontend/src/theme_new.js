import { createTheme } from '@mui/material/styles';

const greyMain = '#b0b0b0';
const greyLight = '#e0e0e0';
const greyDark = '#2c2c2c';
const backgroundDefault = '#121212';
const backgroundPaper = '#1e1e1e';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: greyLight,
      contrastText: '#000000',
    },
    secondary: {
      main: greyMain,
      contrastText: '#ffffff',
    },
    background: {
      default: backgroundDefault,
      paper: backgroundPaper,
    },
    text: {
      primary: greyLight,
      secondary: greyMain,
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
          backgroundColor: '#666666',
          color: '#ffffff',
          boxShadow: `0 0 8px #666666`,
          '&:hover': {
            boxShadow: `0 0 16px #555555`,
            backgroundColor: '#555555',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: `0 0 15px ${greyLight}`,
        },
      },
    },
  },
});

export default theme;
