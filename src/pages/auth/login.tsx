"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { signIn } from "@/lib/auth-client";
import { Input } from "@/components/shared/atoms/Input";
import { Label } from "@/components/shared/atoms/Label";

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
    const [twoFactorCode, setTwoFactorCode] = useState("");

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // If we are in 2FA step, verify code first
        if (step === '2fa') {
            handle2FASubmit(e);
            return;
        }

        setLoading(true);

        try {
            // 1. Check if 2FA is enabled for this user
            const checkRes = await fetch('/api/auth/check-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const checkData = await checkRes.json();

            if (!checkRes.ok) {
                throw new Error(checkData.message || "Login check failed");
            }

            // 2. If 2FA is required, move to step 2
            if (checkData.require2FA) {
                setStep('2fa');
                setLoading(false);
                return;
            }

            // 3. If 2FA is NOT required, proceed with login
            performLogin();

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
            setLoading(false);
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Verify code with backend
            const verifyRes = await fetch('/api/auth/verify-2fa-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: twoFactorCode })
            });

            if (!verifyRes.ok) {
                throw new Error("Invalid verification code");
            }

            // If valid, proceed with login
            performLogin();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const performLogin = async () => {
        await signIn.email(
            {
                email,
                password,
                rememberMe,
            },
            {
                onRequest: () => {
                    setLoading(true);
                },
                onResponse: () => {
                    setLoading(false);
                },
                onSuccess: async (ctx: any) => {
                    const session = ctx.data;
                    if (session?.user?.role === 'superAdmin' || session?.user?.role === 'admin') {
                        router.push("/admin/dashboard");
                    } else {
                        router.push("/dashboard");
                    }
                },
                onError: (ctx: any) => {
                    setError(ctx.error.message || "Login failed. Please check your credentials.");
                    setStep('credentials'); // Reset to step 1 on failure
                    setLoading(false);
                },
            }
        );
    };

    const handleGoogleSignIn = async () => {
        await signIn.social(
            {
                provider: "google",
                callbackURL: "/dashboard",
            },
            {
                onRequest: () => {
                    setLoading(true);
                },
                onResponse: () => {
                    setLoading(false);
                },
                onError: (ctx: any) => {
                    setError(ctx.error.message || "Google login failed.");
                },
            }
        );
    };

    return (
        <>
            <Head>
                <title>Sign In | LPK PB Merdeka</title>
            </Head>
            <div className="h-screen w-full flex bg-gray-50 dark:bg-zinc-950 overflow-hidden">
                {/* Left Side - Image/Branding */}
                <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-red-700">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-900 opacity-90 mix-blend-multiply"></div>

                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12 text-center text-white space-y-8">
                        {/* Logo Placeholder or Icon */}
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        </div>

                        <div className="space-y-4 max-w-lg">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm">Welcome Back</h2>
                            <p className="text-lg text-red-50 leading-relaxed font-medium">
                                Professional job training platform to help build your brilliant career future.
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
                    {/* Back to Home Button - Desktop */}
                    <Link
                        href="/"
                        className="hidden lg:flex absolute top-6 left-6 items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Home</span>
                    </Link>

                    <div className="w-full max-w-[440px] space-y-8">
                        {/* Back to Home Button - Mobile */}
                        <div className="lg:hidden w-full mb-8">
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
                        <div className="space-y-2 text-center lg:text-left">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                {step === 'credentials' ? 'Sign In' : 'Two-Factor Authentication'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                {step === 'credentials' ? 'Please enter your account details to continue' : 'Enter the code from your authenticator app'}
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="text-red-600 dark:text-red-400 mt-0.5">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSignIn} className="space-y-6">
                            {step === 'credentials' ? (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <Link
                                                href="/auth/forgot-password"
                                                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-600">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="pl-10 pr-12 py-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:border-red-500 focus:ring-red-500/20 rounded-xl transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                                            >
                                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
                                        />
                                        <Label htmlFor="remember" className="cursor-pointer text-gray-600 dark:text-gray-400 font-normal select-none">Remember me</Label>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <Label htmlFor="2fa-code">6-Digit Code</Label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-600">
                                                <FaShieldAlt className="w-5 h-5" />
                                            </div>
                                            <Input
                                                id="2fa-code"
                                                type="text"
                                                placeholder="000000"
                                                value={twoFactorCode}
                                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                required
                                                autoFocus
                                                maxLength={6}
                                                className="pl-10 py-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:border-red-500 focus:ring-red-500/20 rounded-xl transition-all text-center tracking-widest text-2xl font-mono"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStep('credentials')}
                                        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 block text-center"
                                    >
                                        &larr; Use another account
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-red-600/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none bg-[length:200%_200%] animate-gradient"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {step === 'credentials' ? 'Processing...' : 'Verifying...'}
                                    </span>
                                ) : (step === 'credentials' ? "Sign In" : "Verify Login")}
                            </button>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-gray-50 dark:bg-zinc-950 text-gray-500 font-medium tracking-wide text-xs uppercase">Or continue with</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-white font-medium py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-gray-600 dark:text-gray-300">Google</span>
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{" "}
                            <Link href="/auth/register" className="text-red-600 hover:text-red-700 font-semibold transition-colors hover:underline">
                                Register Now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
