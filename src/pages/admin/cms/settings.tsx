import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaSave, FaCog, FaSpinner } from 'react-icons/fa';
import { Toast } from '@/components/shared/molecules/Toast';

export default function CMSSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({});

    // Toast State
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/cms/settings', { headers: getAuthHeaders() });
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

    const handleChange = (key: string, value: string) => {
        setSettings({ ...settings, [key]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/cms/settings', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setToast({ isOpen: true, message: 'Settings saved successfully!', type: 'success' });
            } else {
                const data = await res.json();
                setToast({ isOpen: true, message: data.message || 'Failed to save settings', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error saving settings', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout title="CMS: Settings">
            <Head>
                <title>Settings | Admin</title>
            </Head>

            <div className="w-full">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600"><FaCog /></div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">General Settings</h2>
                            <p className="text-sm text-gray-500">Manage contact info and social links.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            {/* Contact Information */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={settings.contact_email || ''}
                                            onChange={e => handleChange('contact_email', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={settings.contact_phone || ''}
                                            onChange={e => handleChange('contact_phone', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                                        <input
                                            type="text"
                                            value={settings.contact_whatsapp || ''}
                                            onChange={e => handleChange('contact_whatsapp', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                            placeholder="628..."
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <textarea
                                            rows={3}
                                            value={settings.contact_address || ''}
                                            onChange={e => handleChange('contact_address', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Social Media */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Social Media</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                                        <input
                                            type="text"
                                            value={settings.social_instagram || ''}
                                            onChange={e => handleChange('social_instagram', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                                        <input
                                            type="text"
                                            value={settings.social_facebook || ''}
                                            onChange={e => handleChange('social_facebook', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                                        <input
                                            type="text"
                                            value={settings.social_linkedin || ''}
                                            onChange={e => handleChange('social_linkedin', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                                        <input
                                            type="text"
                                            value={settings.social_youtube || ''}
                                            onChange={e => handleChange('social_youtube', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Maps */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Location</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label>
                                    <input
                                        type="text"
                                        value={settings.map_embed_url || ''}
                                        onChange={e => handleChange('map_embed_url', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                        placeholder="https://www.google.com/maps/embed?..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Paste the &apos;src&apos; link from Google Maps &apos;Share &gt; Embed a map&apos;.</p>
                                </div>
                            </section>

                            <div className="pt-6 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isOpen: false })}
            />
        </AdminLayout>
    );
}
