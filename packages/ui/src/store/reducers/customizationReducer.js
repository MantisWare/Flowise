// project imports
import config from '@/config'

// action - state management
import * as actionTypes from '../actions'

// VibeForge Embedded: Always default to dark mode, parent controls theme
const getInitialDarkMode = () => {
    const parentTheme = localStorage.getItem('vibeforgeTheme')
    if (parentTheme === 'light' || parentTheme === 'dark') {
        return parentTheme === 'dark'
    }
    // Default to dark mode
    return true
}

const defaultDarkMode = getInitialDarkMode()

// Set dark mode in localStorage to persist
if (!localStorage.getItem('vibeforgeTheme')) {
    localStorage.setItem('isDarkMode', 'true')
}

export const initialState = {
    isOpen: [], // for active default menu
    fontFamily: config.fontFamily,
    borderRadius: config.borderRadius,
    opened: true,
    isHorizontal: localStorage.getItem('isHorizontal') === 'true' ? true : false,
    isDarkMode: defaultDarkMode
}

// ==============================|| CUSTOMIZATION REDUCER ||============================== //

const customizationReducer = (state = initialState, action) => {
    let id
    switch (action.type) {
        case actionTypes.MENU_OPEN:
            id = action.id
            return {
                ...state,
                isOpen: [id]
            }
        case actionTypes.SET_MENU:
            return {
                ...state,
                opened: action.opened
            }
        case actionTypes.SET_FONT_FAMILY:
            return {
                ...state,
                fontFamily: action.fontFamily
            }
        case actionTypes.SET_BORDER_RADIUS:
            return {
                ...state,
                borderRadius: action.borderRadius
            }
        case actionTypes.SET_LAYOUT:
            return {
                ...state,
                isHorizontal: action.isHorizontal
            }
        case actionTypes.SET_DARKMODE:
            // VibeForge Embedded: Theme changes controlled by parent
            localStorage.setItem('vibeforgeTheme', action.isDarkMode ? 'dark' : 'light')
            localStorage.setItem('isDarkMode', action.isDarkMode ? 'true' : 'false')
            return {
                ...state,
                isDarkMode: action.isDarkMode
            }
        default:
            return state
    }
}

export default customizationReducer
