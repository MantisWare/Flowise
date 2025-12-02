import PropTypes from 'prop-types'

// VibeForge Embedded: Simplified RequireAuth for embedded mode

export const RequireAuth = ({ permission, display, children }) => {
    // VibeForge Embedded: Always bypass all authentication checks
    return children
}

RequireAuth.propTypes = {
    permission: PropTypes.string,
    display: PropTypes.string,
    children: PropTypes.element
}
