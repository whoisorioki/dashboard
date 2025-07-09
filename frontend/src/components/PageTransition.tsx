import { Box, Fade } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { ReactNode, useEffect, useState } from 'react'

interface PageTransitionProps {
    children: ReactNode
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    const location = useLocation()
    const [displayLocation, setDisplayLocation] = useState(location)
    const [transitionStage, setTransitionStage] = useState("fadeIn")

    useEffect(() => {
        if (location !== displayLocation) {
            setTransitionStage("fadeOut")
        }
    }, [location, displayLocation])

    return (
        <Fade
            in={transitionStage === "fadeIn"}
            timeout={300}
            onExited={() => {
                setDisplayLocation(location)
                setTransitionStage("fadeIn")
            }}
        >
            <Box
                sx={{
                    minHeight: '100vh',
                    transition: 'all 0.3s ease-in-out',
                }}
            >
                {children}
            </Box>
        </Fade>
    )
}

export default PageTransition
