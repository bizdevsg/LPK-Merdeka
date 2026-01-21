import React, { useState, useEffect, useCallback } from "react";
import { FaUser, FaEnvelope, FaLock, FaSave, FaEye, FaEyeSlash, FaPhone, FaMapMarkerAlt, FaCalendar, FaVenusMars, FaCamera, FaTimes, FaCheck } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from "@/lib/cropImage";

export const ProfileForm = () => {
    const { user } = useAuth();

    // Core fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    // New fields
    const [gender, setGender] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [birthPlace, setBirthPlace] = useState("");
    const [address, setAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");

    // Password fields
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Cropper State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [showCropModal, setShowCropModal] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user');
                if (res.ok) {
                    const u = await res.json();

                    setName(u.name || "");
                    setEmail(u.email || "");
                    setGender(u.gender || "");
                    setBirthDate(u.birthDate ? new Date(u.birthDate).toISOString().split('T')[0] : "");
                    setBirthPlace(u.birthPlace || "");
                    setAddress(u.address || "");
                    setPhoneNumber(u.phoneNumber || "");
                    setPhotoUrl(u.photo_url || u.image || "");
                }
            } catch (error) {
                console.error("Failed to fetch fresh profile data:", error);
                if (user) {
                    setName(user.name || "");
                    setEmail(user.email || "");
                }
            }
        };

        fetchProfile();
    }, [user]);

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result as string);
                setShowCropModal(true);
            });
            reader.readAsDataURL(file);
        }
        // Reset input logic if needed
        e.target.value = '';
    };

    const handleUploadCropped = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setUploading(true);
        setMessage(null);

        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedBlob) throw new Error("Failed to crop image");

            const formData = new FormData();
            formData.append("file", croppedBlob, "profile.jpg");

            const res = await fetch("/api/upload/profile-photo", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Upload failed");

            setPhotoUrl(data.url);
            setMessage({ type: "success", text: "Foto berhasil diunggah! Jangan lupa simpan perubahan." });
            setShowCropModal(false);
            setImageSrc(null);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (password && password !== passwordConfirmation) {
            setLoading(false);
            setMessage({ type: "error", text: "Password confirmation does not match." });
            return;
        }

        if (password && !currentPassword) {
            setLoading(false);
            setMessage({ type: 'error', text: 'Password saat ini diperlukan untuk mengubah password.' });
            return;
        }

        try {
            const res = await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    gender,
                    birthDate,
                    birthPlace,
                    address,
                    phoneNumber,
                    photo_url: photoUrl
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Gagal memperbarui profil");
            }

            if (password) {
                const { error } = await authClient.changePassword({
                    newPassword: password,
                    currentPassword: currentPassword,
                    revokeOtherSessions: true
                });
                if (error) throw error;
            }

            setMessage({ type: "success", text: "Profile updated successfully!" });
            setPassword("");
            setPasswordConfirmation("");
            setCurrentPassword("");

        } catch (err: any) {
            const msg = err?.message || err?.body?.message || "Gagal memperbarui profil";
            setMessage({ type: "error", text: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Crop Modal */}
            {showCropModal && imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-lg overflow-hidden flex flex-col h-[500px]">
                        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 z-10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sesuaikan Foto</h3>
                            <button onClick={() => setShowCropModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="relative flex-1 bg-black">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Zoom</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <button
                                onClick={handleUploadCropped}
                                disabled={uploading}
                                className="w-full py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition px-4 flex items-center justify-center gap-2"
                            >
                                {uploading ? "Memproses..." : <><FaCheck /> Simpan Foto</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <div className="relative group">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-zinc-700">
                            {photoUrl ? (
                                <Image src={photoUrl} alt="Profile" fill className="object-cover" />
                            ) : (
                                <FaUser className="text-4xl text-gray-400" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors shadow-sm">
                            <FaCamera size={14} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                        </label>
                    </div>

                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Lengkapi data diri Anda untuk mengakses <strong className="text-red-600">Pusat Belajar</strong>
                        </p>
                        {uploading && !showCropModal && <p className="text-xs text-blue-500 mt-1">Mengunggah foto...</p>}
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-2 mb-4">Informasi Pribadi</h3>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all dark:bg-zinc-800 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800/50 cursor-not-allowed text-gray-500"
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaVenusMars className="text-gray-400" />
                                </div>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all dark:bg-zinc-800 dark:text-white appearance-none"
                                >
                                    <option value="">Pilih Jenis Kelamin</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Telepon</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaPhone className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all dark:bg-zinc-800 dark:text-white"
                                    placeholder="08..."
                                />
                            </div>
                        </div>

                        {/* Birth Place */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tempat Lahir</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaMapMarkerAlt className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={birthPlace}
                                    onChange={(e) => setBirthPlace(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all dark:bg-zinc-800 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Birth Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaCalendar className="text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all dark:bg-zinc-800 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Lengkap</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all dark:bg-zinc-800 dark:text-white resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Keamanan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Saat Ini (Diperlukan untuk ubah password)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all dark:bg-zinc-800 dark:text-white"
                                    />
                                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Baru</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all dark:bg-zinc-800 dark:text-white"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Password Baru</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all dark:bg-zinc-800 dark:text-white"
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md font-medium"
                        >
                            {loading ? "Menyimpan..." : (
                                <>
                                    <FaSave />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
