import { useRoutes } from 'react-router-dom'

// routes
import MainRoutes from './MainRoutes'
import CanvasRoutes from './CanvasRoutes'
import ChatbotRoutes from './ChatbotRoutes'
import config from '@/config'
import ExecutionRoutes from './ExecutionRoutes'

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
    // VibeForge Embedded: Permanently exclude auth routes
    const routes = [MainRoutes, CanvasRoutes, ChatbotRoutes, ExecutionRoutes]

    return useRoutes(routes, config.basename)
}
