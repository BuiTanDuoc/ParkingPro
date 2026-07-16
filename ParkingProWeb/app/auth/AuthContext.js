import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import { login as loginApi, logoutApi } from './../api/auth';
import { getMyProfile } from './../api/users';
import { tokenStorage } from './../api/http';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async () => {
        try {
            const profile = await getMyProfile();
            setUser(profile);
        } catch (err) {
            setUser(null);
            tokenStorage.clear();
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (tokenStorage.getAccessToken()) {
            loadProfile();
        } else {
            setLoading(false);
        }

        const onForceLogout = () => setUser(null);
        window.addEventListener('auth:logout', onForceLogout);
        return () => window.removeEventListener('auth:logout', onForceLogout);
    }, [loadProfile]);

    const login = async (email, password) => {
        await loginApi(email, password);
        await loadProfile();
    };

    const logout = async () => {
        await logoutApi();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile: loadProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
