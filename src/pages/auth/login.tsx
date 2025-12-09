import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { Navbar } from "../../components/organisms";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Login gagal, periksa email dan password.");
            }

            // Save token and user info via context
            login(data.token, data.user);

            console.log("Login berhasil");
            router.push("/dashboard");
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
                <title>Masuk | LPK PB Merdeka</title>
            </Head>
            <Navbar hideNavigation={true} />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 pt-20">
                <div className="bg-white shadow-xl p-8 rounded-xl w-full max-w-md border border-gray-100">
                    <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">Selamat Datang Kembali</h1>
                    <p className="text-center text-gray-500 mb-6">Masuk untuk mengakses dashboard Anda</p>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {loading ? "Memproses..." : "Masuk"}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-6 text-gray-600">
                        Belum punya akun?{" "}
                        <Link href="/auth/register" className="text-red-600 font-semibold hover:underline">
                            Daftar Sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
