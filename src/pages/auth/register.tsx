"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signUp } from "@/lib/auth-client";
import { Input } from "@/components/shared/atoms/Input";
import { Label } from "@/components/shared/atoms/Label";

export default function SignUp() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            setError("Password and confirmation do not match");
            return;
        }

        setError("");

        await signUp.email(
            {
                email,
                password,
                name,
            },
            {
                onRequest: () => {
                    setLoading(true);
                },
                onResponse: () => {
                    setLoading(false);
                },
                onSuccess: async () => {
                    // Redirect to login after successful registration
                    router.push("/auth/login?registered=true");
                },
                onError: (ctx: any) => {
                    setError(ctx.error.message || "Registration failed. Please try again.");
                },
            }
        );
    };

    return (
        <>
            <Head>
                <title>Register | LPK PB Merdeka</title>
            </Head>
            <div className="h-screen w-full flex bg-gray-50 dark:bg-zinc-950 overflow-hidden">
                {/* Left Side - Image/Branding */}
                <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-red-700">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-900 opacity-90 mix-blend-multiply"></div>

                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12 text-center text-white space-y-8">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                        </div>
                        <div className="space-y-4 max-w-lg">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm">Join Us Today</h2>
                            <p className="text-lg text-red-50 leading-relaxed font-medium">
                                Enhance your digital skills and unlock global career opportunities with thousands of talents.
                            </p>
                        </div>

                        {/* decorative elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-red-500 rounded-full mix-blend-screen opacity-20 filter blur-3xl animate-blob"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-500 rounded-full mix-blend-screen opacity-20 filter blur-3xl animate-blob animation-delay-2000"></div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-12 h-full relative overflow-y-auto">
                    {/* Back to Home Button */}
                    {/* Back to Home Button - Desktop (Absolute) */}
                    <Link
                        href="/"
                        className="hidden lg:flex absolute top-6 left-6 items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Home</span>
                    </Link>

                    <div className="w-full max-w-[440px] h-full flex flex-col justify-center py-6">
                        {/* Back to Home Button - Mobile (In Flow) */}
                        <div className="lg:hidden w-full mb-6">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors group"
                            >
                                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Back to Home</span>
                            </Link>
                        </div>
                        <div className="space-y-2 text-center lg:text-left mb-8">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create Account</h1>
                            <p className="text-gray-500 dark:text-gray-400">Fill in your details to get started</p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 mb-6 animate-in fade-in slide-in-from-top-2">
                                <div className="text-red-600 dark:text-red-400 mt-0.5">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSignUp} className="space-y-5" method="post" action="#">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        autoComplete="name"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="pl-10 py-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:border-red-500 focus:ring-red-500/20 rounded-xl transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="username"
                                        placeholder="nama@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 py-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:border-red-500 focus:ring-red-500/20 rounded-xl transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-600">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-10 pr-10 py-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:border-red-500 focus:ring-red-500/20 rounded-xl transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                                        >
                                            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm</Label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-600">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            required
                                            className="pl-10 pr-10 py-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:border-red-500 focus:ring-red-500/20 rounded-xl transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                                        >
                                            {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-red-600/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none bg-[length:200%_200%] animate-gradient"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : "Register Now"}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6 md:mt-8">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-red-600 font-semibold hover:text-red-700 transition-colors hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
