import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ConnectionStatus from './components/ConnectionStatus';

// Create theme and query client
const theme = createTheme();
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function DebugApp() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div style={{ padding: '20px' }}>
                    <h1>Debug & Connection Test</h1>
                    <p>If you can see this, React is working!</p>
                    <ConnectionStatus />
                </div>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

// Try rendering a very simple component
try {
    const rootElement = document.getElementById('root')
    if (rootElement) {
        ReactDOM.createRoot(rootElement).render(
            <React.StrictMode>
                <DebugApp />
            </React.StrictMode>
        )
    } else {
        console.error('Root element not found!')
        document.body.innerHTML = '<div style="padding: 20px; color: red;">Root element not found!</div>'
    }
} catch (error) {
    console.error('Error rendering React app:', error)
    const errorDisplay = document.getElementById('error-display')
    if (errorDisplay) {
        errorDisplay.innerHTML = `
      <div style="padding: 20px; border: 1px solid red; margin: 20px; background-color: #ffeeee;">
        <h3 style="color: red;">Error rendering React app:</h3>
        <pre style="white-space: pre-wrap;">${error instanceof Error ? error.stack : String(error)}</pre>
      </div>
    `
    }
}
