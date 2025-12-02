import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'

import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, StyledEngineProvider } from '@mui/material'

// routing
import Routes from '@/routes'

// defaultTheme
import themes from '@/themes'

// project imports
import NavigationScroll from '@/layout/NavigationScroll'
import { SET_DARKMODE } from '@/store/actions'

// ==============================|| APP ||============================== //

const App = () => {
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()

    // VibeForge Embedded: Listen for theme changes from parent window
    useEffect(() => {
        const handleMessage = (event) => {
            // Accept messages from any origin (in production, you might want to check event.origin)
            if (event.data && event.data.type === 'VIBEFORGE_THEME_CHANGE') {
                const isDarkMode = event.data.theme === 'dark'
                dispatch({ type: SET_DARKMODE, isDarkMode })
            }
        }

        window.addEventListener('message', handleMessage)

        return () => {
            window.removeEventListener('message', handleMessage)
        }
    }, [dispatch])

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes(customization)}>
                <CssBaseline />
                <NavigationScroll>
                    <Routes />
                </NavigationScroll>
            </ThemeProvider>
        </StyledEngineProvider>
    )
}

export default App
