import React, { createContext, useState, useContext, useEffect } from 'react';

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

    const createMockUser = (name, email) => ({
        id: email.toLowerCase(),
        name,
        email,
    });

    useEffect(() => {
        const storedUser = readStoredUser();

        if (storedUser) {
            setUser(storedUser);
        }

        setLoading(false);
    }, []);

    const login = (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    const mockUser = createMockUser('John Doe', email);
                    setUser(mockUser);
                    localStorage.setItem('user', JSON.stringify(mockUser));
                    resolve(mockUser);
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000);
        });
    };

    const register = (name, email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (name && email && password) {
                    const mockUser = createMockUser(name, email);
                    setUser(mockUser);
                    localStorage.setItem('user', JSON.stringify(mockUser));
                    resolve(mockUser);
                } else {
                    reject(new Error('Invalid data'));
                }
            }, 1000);
        });
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
