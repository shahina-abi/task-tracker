import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext();

const readStoredUser = () => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
        localStorage.removeItem('user');
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch (error) {
        localStorage.removeItem('user');
        return null;
    }
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = readStoredUser();

        if (storedUser) {
            setUser(storedUser);
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const loggedInUser = await loginUser({ email, password });
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        return loggedInUser;
    };

    const register = async (name, email, password) => {
        const newUser = await registerUser({ name, email, password });
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
