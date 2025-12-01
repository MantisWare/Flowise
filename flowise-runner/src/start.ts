import 'reflect-metadata'
import dotenv from 'dotenv'
import { start } from './index'

// Load environment variables
dotenv.config()

// Start the server
start().catch((error) => {
    console.error('Failed to start Flowise Runner:', error)
    process.exit(1)
})

