import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            setError("Password dan Konfirmasi Password tidak cocok");
            return;
        }

        setLoading(true);
        setError("");

        // Default to localhost if env not set (failsafe)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation
                }),
            });

            let data;
            const responseText = await response.text();

            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("API Error (Non-JSON):", responseText);
                throw new Error(`Sistem error (Status: ${response.status}). Cek konsol browser.`);
            }

            if (!response.ok) {
                // Handle Laravel validation errors
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat().join(", ");
                    throw new Error(errorMessages || data.message || "Data pendaftaran tidak valid");
                }

                throw new Error(data.message || data.error || "Pendaftaran gagal, coba lagi.");
            }

            console.log("Registrasi berhasil");
            // Redirect to login page after successful registration
            router.push("/auth/login");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Daftar Akun | LPK PB Merdeka</title>
            </Head>
            <div className="h-screen w-screen overflow-hidden flex bg-white">
                {/* Left Side - Image/Branding */}
                <div className="hidden lg:flex w-1/2 bg-red-600 items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-multiply"></div>
                    <div className="z-10 text-center p-12">
                        <h2 className="text-4xl font-bold text-white mb-4">Bergabung Bersama Kami</h2>
                        <p className="text-red-100 text-lg max-w-md mx-auto">
                            Tingkatkan kompetensi digital Anda dan raih peluang karir global.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-zinc-950">
                    <div className="w-full max-w-md h-full overflow-y-auto [&::-webkit-scrollbar]:hidden">
                        <div className="flex flex-col justify-center min-h-full py-6">
                            <div className="text-center lg:text-left mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buat Akun Baru</h1>
                                <p className="text-gray-500 mt-2">Lengkapi data diri Anda untuk mendaftar</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md animate-in fade-in">
                                    <p className="text-red-700 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleRegister} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        placeholder="Nama Lengkap"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white dark:bg-zinc-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white dark:bg-zinc-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white dark:bg-zinc-800 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                                        >
                                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Konfirmasi Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white dark:bg-zinc-800 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                                        >
                                            {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-red-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Memproses...
                                        </span>
                                    ) : "Daftar Sekarang"}
                                </button>
                            </form>

                            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                                Sudah punya akun?{" "}
                                <Link href="/auth/login" className="text-red-600 font-semibold hover:text-red-700 transition-colors">
                                    Masuk
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
