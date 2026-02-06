import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import * as OTPAuth from 'otpauth';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        let { code, email } = req.body;

        if (!code || !email) {
            return res.status(400).json({ message: 'Code and email are required' });
        }

        code = code.toString().trim();
        console.log(`[2FA] Verifying code: ${code} (Length: ${code.length}) for ${email}`);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { twoFactor: true }
        });

        if (!user || !user.twoFactor || !user.twoFactor.enabled) {
            console.log('[2FA] Invalid request: User not found or 2FA disabled');
            return res.status(400).json({ message: 'Invalid request' });
        }

        let isVerified = false;
        let isBackupCode = false;

        // 1. BACKUP CODE VERIFICATION (Not 6 digits = Backup Code)
        // Backup codes are typically 8 chars but might vary slightly due to generation method
        if (code.length !== 6) {
            const normalizedCode = code.toUpperCase();
            let backupCodes: string[] = [];

            try {
                backupCodes = user.twoFactor.backupCodes ? JSON.parse(user.twoFactor.backupCodes) : [];
            } catch (e) {
                backupCodes = [];
            }

            console.log(`[2FA] Checking against ${backupCodes.length} backup codes`);

            if (backupCodes.includes(normalizedCode)) {
                // Remove used code (one-time use)
                const remainingCodes = backupCodes.filter(c => c !== normalizedCode);
                await prisma.twoFactor.update({
                    where: { id: user.twoFactor.id },
                    data: { backupCodes: JSON.stringify(remainingCodes) }
                });
                isVerified = true;
                isBackupCode = true;
                console.log('[2FA] Backup code matched and consumed');
            } else {
                console.log(`[2FA] Backup code mismatch. Input: ${normalizedCode}`);
            }

            // 2. TOTP VERIFICATION (6 digits)
        } else if (code.length === 6) {
            const totp = new OTPAuth.TOTP({
                issuer: 'LPK PB Merdeka',
                label: email,
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromBase32(user.twoFactor.secret),
            });

            if (totp.validate({ token: code, window: 1 }) !== null) {
                isVerified = true;
                console.log('[2FA] TOTP Verified');
            } else {
                console.log('[2FA] TOTP Invalid');
            }
        }

        if (!isVerified) {
            console.log(`[2FA] Verification failed. Type: ${isBackupCode ? 'Backup' : 'TOTP'} code invalid.`);
            return res.status(400).json({ message: isBackupCode ? 'Invalid backup code' : 'Invalid verification code' });
        }

        console.log(`[2FA] Verification successful. Type: ${isBackupCode ? 'Backup' : 'TOTP'}`);
        console.log('[2FA] Creating session manualy for user:', user.id);

        // 3. CREATE SESSION (Manual DB Insert)
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await prisma.session.create({
            data: {
                id: uuidv4(),
                token: token,
                userId: user.id,
                expiresAt: expiresAt,
                userAgent: req.headers['user-agent'] || null,
                ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null
            }
        });

        // Set session cookie
        const isSecure = process.env.NODE_ENV === 'production';
        const cookieName = 'better-auth.session_token';
        const cookieValue = `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${isSecure ? '; Secure' : ''}`;

        res.setHeader('Set-Cookie', cookieValue);

        // Self-test: Check if Better Auth accepts this session
        console.log('[2FA] Testing manually created session...');
        try {
            const simulatedHeaders = new Headers();
            simulatedHeaders.append('cookie', cookieValue);

            const check = await auth.api.getSession({
                headers: simulatedHeaders
            });
            console.log('[2FA] Session check result:', check ? 'Valid' : 'Invalid');

            if (!check) {
                console.log('[2FA] DEBUG: auth.api keys:', Object.keys(auth.api));
            }
        } catch (e) {
            console.log('[2FA] Session check failed error:', e);
        }

        return res.status(200).json({
            success: true,
            message: 'Verified',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('2FA code check error:', error);
        return res.status(500).json({ message: 'Verification failed' });
    }
}
