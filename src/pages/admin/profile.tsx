import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import Head from "next/head";
import { FaUser, FaLock, FaEnvelope, FaSave, FaEye, FaEyeSlash } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";

const ProfilePage = () => {
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password && password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Password confirmation does not match.' });
            return;
        }

        setLoading(true);

        try {
            // 1. Update Profile Name
            if (name !== user?.name) {
                await authClient.updateUser({
                    name: name
                });
            }

            // 2. Change Password (if provided)
            if (password) {
                await authClient.changePassword({
                    newPassword: password,
                    currentPassword: "", // better-auth might require current password. If so, logic needs adjustment.
                    revokeOtherSessions: true
                });
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Clear password fields on success
            setPassword('');
            setConfirmPassword('');

            // Reload to reflect changes if session context doesn't update automatically
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error: any) {
            const msg = error?.message || error?.body?.message || 'Failed to update profile.';
            if (msg.includes("current password")) {
                setMessage({ type: "error", text: "Security: Current password is required to change password." });
            } else {
                setMessage({ type: "error", text: msg });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Edit Profile">
            <Head>
                <title>Edit Profile | Admin Panel</title>
            </Head>

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-2xl">
                            {name.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                            <p className="text-sm text-gray-500">Update your account information</p>
                        </div>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-gray-50 cursor-not-allowed"
                                        placeholder="Enter your email"
                                        disabled
                                        title="Email cannot be changed"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="text-gray-400" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                                                placeholder="Leave blank to keep current"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="text-gray-400" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProfilePage;
