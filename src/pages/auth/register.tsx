import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { Navbar } from "@/components/shared/organisms";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Pendaftaran gagal, coba lagi.");
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
            <Navbar hideNavigation={true} />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 pt-20">
                <div className="bg-white shadow-xl p-8 rounded-xl w-full max-w-md border border-gray-100">
                    <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">Daftar Akun Baru</h1>
                    <p className="text-center text-gray-500 mb-6">Mulai perjalanan karir Anda bersama kami</p>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                placeholder="Nama Lengkap"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            />
                        </div>

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
                            {loading ? "Memproses..." : "Daftar"}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-6 text-gray-600">
                        Sudah punya akun?{" "}
                        <Link href="/auth/login" className="text-red-600 font-semibold hover:underline">
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
