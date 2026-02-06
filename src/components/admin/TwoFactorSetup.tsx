import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaQrcode, FaKey, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import QRCode from 'qrcode'; // Keeps the import, though unused if we use the backend provided QR URL directly? The backend implementation returns a data URL probably.

export const TwoFactorSetup = () => {
    const { user } = useAuth();
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [showSetup, setShowSetup] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [inputError, setInputError] = useState('');

    // Check if 2FA is already enabled
    useEffect(() => {
        const check2FAStatus = async () => {
            try {
                const res = await fetch('/api/user/2fa/status');
                if (res.ok) {
                    const data = await res.json();
                    setTwoFactorEnabled(data.enabled);
                }
            } catch (error) {
                console.error('Failed to check 2FA status:', error);
            }
        };
        check2FAStatus();
    }, []);

    const handleGenerateSecret = async () => {
        setLoading(true);
        setMessage(null);

        try {
            // Call our custom 2FA generate endpoint
            const res = await fetch('/api/user/2fa/generate', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response from server');
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to generate secret');
            }

            const { secret: totpSecret, qrCode } = data;

            if (!totpSecret || !qrCode) {
                throw new Error('Invalid response: missing secret or QR code');
            }

            setSecret(totpSecret);
            setQrCodeUrl(qrCode);
            setShowSetup(true);
        } catch (error: any) {
            console.error('2FA generation error:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Failed to generate 2FA secret. Check console for details.'
            });
        } finally {
            setLoading(false);
        }
    };

    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);

    const handleEnable2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setInputError('');
        setIsViewMode(false);

        try {
            // Enable 2FA via our custom endpoint
            const res = await fetch('/api/user/2fa/enable', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: verificationCode
                })
            });

            const data = await res.json();

            if (!res.ok) {
                // Handle error specifically
                setInputError(data.message || 'Invalid verification code');
                setLoading(false);
                return;
            }

            setMessage({ type: 'success', text: '2FA enabled successfully!' });
            setTwoFactorEnabled(true);

            if (data.backupCodes) {
                setBackupCodes(data.backupCodes);
                setShowBackupCodes(true);
            } else {
                // Fallback if no codes returned (should not happen with new API)
                setShowSetup(false);
                setVerificationCode('');
            }

        } catch (error: any) {
            console.error('2FA enable error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to enable 2FA' });
        } finally {
            setLoading(false);
        }
    };

    const handleViewBackupCodes = async () => {
        setLoading(true);
        setMessage(null);
        setIsViewMode(true);

        try {
            const res = await fetch('/api/user/2fa/codes');
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch backup codes');
            }

            if (data.codes && Array.isArray(data.codes)) {
                setBackupCodes(data.codes);
                setShowBackupCodes(true);
            } else {
                throw new Error('Invalid backup codes format');
            }
        } catch (error: any) {
            console.error('Fetch codes error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to fetch backup codes' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCodes = () => {
        const text = `LPK Merdeka 2FA Backup Codes\n\nGenerated on: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nKEEP THESE CODES SAFE!`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lpk-merdeka-backup-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDoneSetup = () => {
        setShowBackupCodes(false);
        setIsViewMode(false);
        setShowSetup(false);
        setVerificationCode('');
        setBackupCodes([]);
    };

    const [showDisableConfirm, setShowDisableConfirm] = useState(false);

    const handleDisable2FA = () => {
        setShowDisableConfirm(true);
    };

    const confirmDisable2FA = async () => {
        setLoading(true);
        setMessage(null);
        setShowDisableConfirm(false);

        try {
            const res = await fetch('/api/user/2fa/disable', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to disable 2FA');
            }

            setMessage({ type: 'success', text: '2FA disabled successfully' });
            setTwoFactorEnabled(false);
        } catch (error: any) {
            console.error('2FA disable error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to disable 2FA' });
        } finally {
            setLoading(false);
        }
    };

    // Only show for admin users
    if (user?.role !== 'admin' && user?.role !== 'superAdmin') {
        return null;
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 md:p-8 relative">
            {/* Backup Codes Modal */}
            {showBackupCodes && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 flex flex-col h-full overflow-hidden">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <FaKey className="text-green-600 dark:text-green-500 text-xl" />
                                </div>
                            </div>

                            <div className="text-center mb-6 flex-shrink-0">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {isViewMode ? 'Emergency Backup Codes' : '2FA Enabled Successfully!'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mx-auto">
                                    {isViewMode
                                        ? 'Below are your active backup codes. You can use these to recover your account if you lose your device.'
                                        : 'Please save these emergency backup codes. You can use them to recover your account if you lose access to your authentication device.'}
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 mb-6 flex-1 overflow-y-auto min-h-[150px]">
                                <div className="grid grid-cols-2 gap-3">
                                    {backupCodes.map((code, index) => (
                                        <div key={index} className="bg-white dark:bg-zinc-900 p-2 rounded border border-gray-100 dark:border-zinc-700 text-center font-mono text-sm tracking-wider text-gray-800 dark:text-gray-200 select-all hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                            {code}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-auto flex-shrink-0">
                                <button
                                    onClick={handleDownloadCodes}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>Download</span>
                                </button>
                                <button
                                    onClick={handleDoneSetup}
                                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    {isViewMode ? 'Close' : "I've Saved Them"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Disable Confirmation Modal */}
            {showDisableConfirm && (
                <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm z-50 rounded-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                <FaExclamationTriangle className="text-red-600 dark:text-red-500 text-xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Disable 2FA?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Are you sure you want to disable Two-Factor Authentication? This will make your account significantly less secure.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDisableConfirm(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDisable2FA}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Yes, Disable
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <FaShieldAlt className="text-2xl text-red-600 dark:text-red-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your admin account</p>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                    {message.text}
                </div>
            )}

            {!twoFactorEnabled && !showSetup && (
                <div className="space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <FaExclamationTriangle className="text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                                    2FA is currently disabled
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    Enable Two-Factor Authentication to secure your admin account with an additional verification step.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateSecret}
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaShieldAlt />
                        {loading ? 'Generating...' : 'Enable 2FA'}
                    </button>
                </div>
            )}

            {showSetup && (
                <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                            <FaQrcode />
                            Step 1: Scan QR Code
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                        </p>
                        {qrCodeUrl && (
                            <div className="bg-white p-4 rounded-lg inline-block">
                                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <FaKey />
                            Manual Entry Key
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Or enter this key manually in your authenticator app:
                        </p>
                        <code className="block bg-white dark:bg-zinc-900 px-4 py-2 rounded border border-gray-200 dark:border-zinc-700 text-sm font-mono break-all">
                            {secret}
                        </code>
                    </div>

                    <form onSubmit={handleEnable2FA} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Step 2: Enter Verification Code
                            </label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => {
                                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                    setInputError(''); // Clear error on typing
                                }}
                                placeholder="000000"
                                maxLength={6}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all dark:bg-zinc-800 dark:text-white text-center text-2xl font-mono tracking-widest ${inputError
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900/30'
                                    : 'border-gray-200 dark:border-zinc-700 focus:ring-red-100 focus:border-red-500'
                                    }`}
                                required
                            />
                            {inputError ? (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium flex items-center gap-1 animate-in slide-in-from-top-1">
                                    <FaExclamationTriangle size={12} />
                                    {inputError}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Enter the 6-digit code from your authenticator app
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading || verificationCode.length !== 6}
                                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaCheck />
                                {loading ? 'Verifying...' : 'Verify & Enable'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSetup(false);
                                    setVerificationCode('');
                                    setInputError('');
                                }}
                                className="px-6 py-3 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {twoFactorEnabled && !showSetup && (
                <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <FaCheck className="text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-1">
                                    2FA is enabled
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Your account is protected with Two-Factor Authentication. You'll need to enter a code from your authenticator app when logging in.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleViewBackupCodes}
                            disabled={loading}
                            className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaKey />
                            {loading ? 'Loading...' : 'View Backup Codes'}
                        </button>
                        <button
                            onClick={handleDisable2FA}
                            disabled={loading}
                            className="px-6 py-3 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaTimes />
                            {loading ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
