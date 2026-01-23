import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

interface Settings {
    contact_email?: string;
    contact_phone?: string;
    contact_whatsapp?: string;
    contact_address?: string;
    social_instagram?: string;
    social_facebook?: string;
    social_linkedin?: string;
    social_youtube?: string;
    map_embed_url?: string;
}

export const Footer = () => {
    const [settings, setSettings] = useState<Settings>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/cms/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Failed to fetch settings', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <footer className="bg-red-600 dark:bg-neutral-900 text-red-50 dark:text-gray-300 pt-16 pb-8 transition-colors duration-300">
            <div className="container mx-auto px-6 lg:px-12 xl:px-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center">
                                <Image
                                    src="/assets/LPK-White.png"
                                    alt="LPK Merdeka Logo"
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-white dark:text-white text-xl font-bold">LPK PB Merdeka</span>
                        </div>
                        <p className="text-red-100 dark:text-gray-400 leading-relaxed text-sm">
                            Mencetak talenta digital berstandar global. Bergabunglah dengan kami dan mulai perjalanan karir masa depan Anda.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white dark:text-white font-bold text-lg mb-6">Menu Utama</h3>
                        <ul className="flex flex-col gap-4">
                            <li><Link href="/" className="hover:text-white dark:hover:text-white transition-colors">Beranda</Link></li>
                            <li><Link href="/about" className="hover:text-white dark:hover:text-white transition-colors">Tentang Kami</Link></li>
                            <li><Link href="/sylabus" className="hover:text-white dark:hover:text-white transition-colors">Silabus</Link></li>
                            <li><Link href="/galeri" className="hover:text-white dark:hover:text-white transition-colors">Galeri</Link></li>
                            <li><Link href="/contact" className="hover:text-white dark:hover:text-white transition-colors">Bantuan</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white dark:text-white font-bold text-lg mb-6">Hubungi Kami</h3>
                        {loading ? (
                            <div className="space-y-4">
                                <div className="animate-pulse bg-white/10 dark:bg-white/5 h-4 rounded w-3/4"></div>
                                <div className="animate-pulse bg-white/10 dark:bg-white/5 h-4 rounded w-1/2"></div>
                                <div className="animate-pulse bg-white/10 dark:bg-white/5 h-4 rounded w-2/3"></div>
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-4">
                                {settings.contact_address && (
                                    <li className="flex items-start gap-3">
                                        <FaMapMarkerAlt className="mt-1 text-white dark:text-white flex-shrink-0" />
                                        <span className="text-sm">{settings.contact_address}</span>
                                    </li>
                                )}
                                {settings.contact_email && (
                                    <li className="flex items-center gap-3">
                                        <FaEnvelope className="text-white dark:text-white flex-shrink-0" />
                                        <a href={`mailto:${settings.contact_email}`} className="text-sm hover:text-white dark:hover:text-white transition-colors">
                                            {settings.contact_email}
                                        </a>
                                    </li>
                                )}
                                {settings.contact_whatsapp && (
                                    <li className="flex items-center gap-3">
                                        <FaWhatsapp className="text-white dark:text-white flex-shrink-0" />
                                        <a
                                            href={`https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm hover:text-white dark:hover:text-white transition-colors"
                                        >
                                            {settings.contact_whatsapp}
                                        </a>
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-white dark:text-white font-bold text-lg mb-6">Ikuti Kami</h3>
                        <p className="text-red-100 dark:text-gray-400 text-sm mb-6">Dapatkan update terbaru seputar program dan kegiatan kami.</p>
                        {loading ? (
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="animate-pulse w-10 h-10 rounded-full bg-white/10 dark:bg-white/5"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                {settings.social_instagram && (
                                    <a
                                        href={settings.social_instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-colors border border-white/20 hover:border-white"
                                    >
                                        <FaInstagram />
                                    </a>
                                )}
                                {settings.social_facebook && (
                                    <a
                                        href={settings.social_facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-colors border border-white/20 hover:border-white"
                                    >
                                        <FaFacebookF />
                                    </a>
                                )}
                                {settings.social_linkedin && (
                                    <a
                                        href={settings.social_linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-colors border border-white/20 hover:border-white"
                                    >
                                        <FaLinkedinIn />
                                    </a>
                                )}
                                {settings.social_youtube && (
                                    <a
                                        href={settings.social_youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-colors border border-white/20 hover:border-white"
                                    >
                                        <FaYoutube />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-red-500 dark:border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-red-100 dark:text-gray-500">
                    <p className="text-sm text-center md:text-left">
                        &copy; {new Date().getFullYear()} LPK PB Merdeka. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};