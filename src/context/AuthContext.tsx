import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

interface User {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const checkAuth = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setIsAuthenticated(false);
            setUser(null);
            return;
        }

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
            const response = await fetch(`${API_URL}/user`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setIsAuthenticated(true);
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
            } else {
                // Token invalid or expired
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed", error);
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
