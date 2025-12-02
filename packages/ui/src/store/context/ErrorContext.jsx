import { createContext, useContext, useState } from 'react'
import { redirectWhenUnauthorized } from '@/utils/genericHelper'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { store } from '@/store'
import { logoutSuccess } from '@/store/reducers/authSlice'
import { ErrorMessage } from '../constant'

const ErrorContext = createContext()

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleError = async (err) => {
        console.error(err)

        // VibeForge Embedded: Skip all authentication error redirects
        if (err?.response?.status === 403) {
            // Ignore 403 errors in embedded mode
            console.log('VibeForge Embedded: Ignoring 403 forbidden error')
            return
        } else if (err?.response?.status === 401) {
            // Ignore 401 errors in embedded mode
            console.log('VibeForge Embedded: Ignoring 401 authentication error')
            return
        } else {
            setError(err)
        }
    }

    return (
        <ErrorContext.Provider
            value={{
                error,
                setError,
                handleError
            }}
        >
            {children}
        </ErrorContext.Provider>
    )
}

export const useError = () => useContext(ErrorContext)

ErrorProvider.propTypes = {
    children: PropTypes.any
}
