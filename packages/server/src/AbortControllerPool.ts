import { createAbortController, safeAbort } from './utils/abortSignalUtils'

/**
 * This pool is to keep track of abort controllers mapped to chatflowid_chatid
 */
export class AbortControllerPool {
    abortControllers: Record<string, AbortController> = {}

    /**
     * Add to the pool
     * @param {string} id
     * @param {AbortController} abortController
     */
    add(id: string, abortController: AbortController) {
        this.abortControllers[id] = abortController
    }

    /**
     * Create and add a new abort controller to the pool
     * @param {string} id
     * @returns {AbortController} The created abort controller
     */
    create(id: string): AbortController {
        const abortController = createAbortController()
        this.add(id, abortController)
        return abortController
    }

    /**
     * Remove from the pool
     * @param {string} id
     */
    remove(id: string) {
        if (Object.prototype.hasOwnProperty.call(this.abortControllers, id)) {
            delete this.abortControllers[id]
        }
    }

    /**
     * Get the abort controller
     * @param {string} id
     */
    get(id: string) {
        return this.abortControllers[id]
    }

    /**
     * Abort
     * @param {string} id
     */
    abort(id: string) {
        safeAbort(this, id)
    }
}
