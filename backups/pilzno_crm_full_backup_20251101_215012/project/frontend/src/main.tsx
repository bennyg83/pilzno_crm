import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Toaster } from 'react-hot-toast'
import App from './App'

// Create a readable theme based on the Pilzno Synagogue emblem with better contrast
const theme = createTheme({
  palette: {
    primary: {
      main: '#6A1B9A', // Lighter purple for better readability
      light: '#9C4DCC',
      dark: '#4A148C', // Original deep purple as accent
    },
    secondary: {
      main: '#FFA726', // Softer orange-gold for better contrast
      light: '#FFD95B',
      dark: '#F57C00',
    },
    success: {
      main: '#43A047', // Brighter green for better visibility
      light: '#66BB6A',
      dark: '#2E7D32',
    },
    background: {
      default: '#FAFAFA', // Very light background for excellent readability
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121', // Dark gray instead of purple for text readability
      secondary: '#424242', // Medium gray for secondary text
    },
    error: {
      main: '#E53935',
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: '#FB8C00',
      light: '#FF9800',
      dark: '#E65100',
    },
    info: {
      main: '#1E88E5',
      light: '#42A5F5',
      dark: '#1565C0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      color: '#212121', // Dark text for headers
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      color: '#212121',
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 500,
      color: '#424242',
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 500,
      color: '#424242',
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      color: '#424242',
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      color: '#424242',
      fontSize: '1.1rem',
    },
    subtitle1: {
      color: '#424242',
      fontWeight: 500,
    },
    subtitle2: {
      color: '#616161',
      fontWeight: 400,
    },
    body1: {
      color: '#212121',
    },
    body2: {
      color: '#424242',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#6A1B9A', // Lighter purple for app bar
          color: '#FFFFFF', // White text for contrast
          boxShadow: '0 2px 8px rgba(106, 27, 154, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(106, 27, 154, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(106, 27, 154, 0.3)',
          },
        },
        containedSecondary: {
          backgroundColor: '#FFA726',
          color: '#FFFFFF', // White text on orange button
          '&:hover': {
            backgroundColor: '#FB8C00',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)', // Neutral shadow
          border: '1px solid rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        colorPrimary: {
          backgroundColor: '#E1BEE7', // Light purple background
          color: '#4A148C', // Dark purple text
        },
        colorSecondary: {
          backgroundColor: '#FFE0B2', // Light orange background
          color: '#E65100', // Dark orange text
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.23)', // Standard border color
            },
            '&:hover fieldset': {
              borderColor: 'rgba(106, 27, 154, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6A1B9A',
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTab-root': {
            color: '#616161',
            '&.Mui-selected': {
              color: '#6A1B9A',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#FFA726',
            height: 3,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 1px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
        },
        elevation4: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#F8F9FA', // Very light background for sidebar
          borderRight: '1px solid #E0E0E0',
        },
      },
    },
  },
})

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#6A1B9A',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontWeight: '500',
            },
            success: {
              style: {
                background: '#43A047',
                color: '#FFFFFF',
              },
            },
            error: {
              style: {
                background: '#E53935',
                color: '#FFFFFF',
              },
            },
          }}
        />
      </HashRouter>
    </ThemeProvider>
  </QueryClientProvider>,
) 