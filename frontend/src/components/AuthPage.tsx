import React, { useState } from 'react'
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Link,
    Alert,
    CircularProgress,
    Container,
    useTheme,
} from '@mui/material'
import { LoginOutlined, PersonAddOutlined } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

interface AuthFormProps {
    onToggleMode: () => void
}

const LoginForm: React.FC<AuthFormProps> = ({ onToggleMode }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { signIn } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await signIn(email, password)

        if (error) {
            setError(error.message)
        }

        setLoading(false)
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                Sign In
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginOutlined />}
            >
                {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
                <Link
                    component="button"
                    variant="body2"
                    onClick={(e) => {
                        e.preventDefault()
                        onToggleMode()
                    }}
                >
                    Don't have an account? Sign up
                </Link>
            </Box>
        </Box>
    )
}

const SignUpForm: React.FC<AuthFormProps> = ({ onToggleMode }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const { signUp } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await signUp(email, password, {
            full_name: fullName,
            role: 'user', // Default role
        })

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
        }

        setLoading(false)
    }

    if (success) {
        return (
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Check Your Email
                </Typography>
                <Alert severity="success" sx={{ mb: 2 }}>
                    We've sent you a confirmation link. Please check your email to complete your registration.
                </Alert>
                <Button variant="outlined" onClick={onToggleMode}>
                    Back to Sign In
                </Button>
            </Box>
        )
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                Sign Up
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TextField
                margin="normal"
                required
                fullWidth
                id="fullName"
                label="Full Name"
                name="fullName"
                autoComplete="name"
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                helperText="Password must be at least 6 characters long"
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <PersonAddOutlined />}
            >
                {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
                <Link
                    component="button"
                    variant="body2"
                    onClick={(e) => {
                        e.preventDefault()
                        onToggleMode()
                    }}
                >
                    Already have an account? Sign in
                </Link>
            </Box>
        </Box>
    )
}

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true)
    const theme = useTheme()

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 3,
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        width: '100%',
                        maxWidth: 400,
                        borderRadius: 2,
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Sales Analytics
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Dashboard Login
                        </Typography>
                    </Box>

                    {isLogin ? (
                        <LoginForm onToggleMode={() => setIsLogin(false)} />
                    ) : (
                        <SignUpForm onToggleMode={() => setIsLogin(true)} />
                    )}
                </Paper>
            </Box>
        </Container>
    )
}

export default AuthPage
