import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
      light: '#60ad5e',
      dark: '#005005',
    },
    secondary: {
      main: '#8d6e63',
      light: '#be9c91',
      dark: '#5f4339',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <GoogleOAuthProvider clientId="757498232012-qdnmq60kbid9qujo61mhumh1v5bbftib.apps.googleusercontent.com">
            <App />
          </GoogleOAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
