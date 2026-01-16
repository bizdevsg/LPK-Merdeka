import React, { useEffect, useState } from 'react';
import { FaCertificate, FaDownload, FaCalendarAlt, FaAward, FaSync } from 'react-icons/fa';
import Link from 'next/link';
import { Toast } from '@/components/shared/molecules/Toast';
import { ConfirmationModal } from '@/components/shared/molecules/ConfirmationModal';

interface Certificate {
    id: string;
    certificate_code: string;
    file_url: string;
    issued_at: string;
    quiz: {
        title: string;
        start_date: string;
    }
}

export const CertificateList: React.FC = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCertId, setSelectedCertId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const res = await fetch('/api/user/certificates');
                if (res.ok) {
                    const data = await res.json();
                    setCertificates(data);
                }
            } catch (error) {
                console.error("Failed to fetch certificates", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    const handleRegenerateClick = (id: string) => {
        setSelectedCertId(id);
        setIsModalOpen(true);
    };

    const handleConfirmRegenerate = async () => {
        if (!selectedCertId) return;

        try {
            const res = await fetch(`/api/user/certificates/${selectedCertId}/regenerate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Update specific certificate URL in state
                setCertificates(prev => prev.map(c => c.id === selectedCertId ? { ...c, file_url: data.file_url } : c));
                setToast({ isOpen: true, message: 'Sertifikat berhasil diperbarui dengan data profil terbaru!', type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Gagal memperbarui sertifikat.', type: 'error' });
            }
        } catch (e) {
            console.error(e);
            setToast({ isOpen: true, message: 'Terjadi kesalahan saat memproses permintaan.', type: 'error' });
        } finally {
            setIsModalOpen(false);
            setSelectedCertId(null);
        }
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Memuat sertifikat...</div>;
    }

    if (certificates.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 text-center border border-gray-100 dark:border-zinc-800">
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <FaCertificate size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Belum Ada Sertifikat</h3>
                <p className="text-gray-500 mt-2">
                    Selesaikan kuis mingguan dengan nilai minimal 70 untuk mendapatkan sertifikat.
                </p>
                <Link href="/dashboard?tab=kuis" className="inline-block mt-4 text-red-600 font-medium hover:underline">
                    Lihat Kuis Tersedia
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaAward className="text-yellow-500" /> Sertifikat Kompetensi Saya
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                    <div key={cert.id} className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all relative overflow-hidden group">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 dark:bg-yellow-900/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 rounded-lg flex items-center justify-center text-xl">
                                    <FaCertificate />
                                </div>
                                <span className="text-xs font-mono text-gray-400 bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded">
                                    {cert.certificate_code}
                                </span>
                            </div>

                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                {cert.quiz.title}
                            </h3>
                            <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                                <FaCalendarAlt className="text-gray-400" />
                                Diterbitkan: {formatDate(cert.issued_at)}
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    href={cert.file_url}
                                    target="_blank"
                                    className="flex-1 bg-gray-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <FaDownload /> Download PDF
                                </Link>
                                <button
                                    onClick={() => handleRegenerateClick(cert.id)}
                                    title="Regenerate Certificate with Latest Name"
                                    className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 p-2.5 rounded-lg transition-colors"
                                >
                                    <FaSync />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmRegenerate}
                title="Perbarui Sertifikat?"
                message="Apakah kamu ingin membuat ulang sertifikat ini? Data nama pada sertifikat akan diperbarui sesuai dengan profil akunmu saat ini."
                confirmText="Ya, Perbarui"
                cancelText="Batal"
            />

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isOpen: false })}
            />
        </div>
    );
};
