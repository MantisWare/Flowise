import { EventEmitter } from 'events'

/**
 * Utility functions for handling AbortSignal and preventing MaxListenersExceededWarning
 */

/**
 * Sets the maximum number of listeners for AbortSignal to prevent MaxListenersExceededWarning
 * This is needed because LangChain components add event listeners to AbortSignal objects
 * and when multiple agents/components are created, these listeners can accumulate.
 */
export const configureAbortSignalListeners = (): void => {
    // Set the default max listeners for EventEmitter to a higher value
    // This affects AbortSignal since it extends EventEmitter
    EventEmitter.defaultMaxListeners = 20

    // Also set it on the process to be safe
    process.setMaxListeners(20)
}

/**
 * Creates a new AbortController with proper listener configuration
 * @returns AbortController with increased max listeners
 */
export const createAbortController = (): AbortController => {
    const controller = new AbortController()

    // Set max listeners on the signal to prevent warnings
    // Note: AbortSignal doesn't have setMaxListeners, but we configure it globally
    // The global configuration in configureAbortSignalListeners handles this

    return controller
}

/**
 * Safely aborts an AbortController and removes it from the pool
 * @param abortControllerPool The abort controller pool
 * @param id The ID of the abort controller to abort
 */
export const safeAbort = (abortControllerPool: any, id: string): void => {
    try {
        const controller = abortControllerPool.get(id)
        if (controller) {
            controller.abort()
            abortControllerPool.remove(id)
        }
    } catch (error) {
        console.warn(`Failed to abort controller ${id}:`, error)
    }
}
