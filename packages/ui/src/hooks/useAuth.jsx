// VibeForge Embedded: Simplified auth hook - always grants all permissions
export const useAuth = () => {
    // VibeForge Embedded: Always return true for all permission checks
    const hasPermission = () => true
    const hasAssignedWorkspace = () => true
    const hasDisplay = () => true

    return { hasPermission, hasAssignedWorkspace, hasDisplay }
}
