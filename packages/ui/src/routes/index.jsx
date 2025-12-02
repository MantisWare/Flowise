import { useRoutes } from 'react-router-dom'

// routes
import MainRoutes from './MainRoutes'
import CanvasRoutes from './CanvasRoutes'
import ChatbotRoutes from './ChatbotRoutes'
import config from '@/config'
import AuthRoutes from '@/routes/AuthRoutes'
import ExecutionRoutes from './ExecutionRoutes'

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
    // VibeForge Embedded Mode: Exclude auth routes
    const routes = process.env.VIBEFORGE_EMBEDDED === 'true'
        ? [MainRoutes, CanvasRoutes, ChatbotRoutes, ExecutionRoutes]
        : [MainRoutes, AuthRoutes, CanvasRoutes, ChatbotRoutes, ExecutionRoutes]

    return useRoutes(routes, config.basename)
}
