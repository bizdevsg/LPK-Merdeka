import { NextApiResponse } from 'next';
import { checkAuth, AuthenticatedRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as OTPAuth from 'otpauth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const userId = req.user?.id;
        const { code } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!code || code.length !== 6) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Get secret from database using Prisma
        const twoFactorRecord = await prisma.twoFactor.findUnique({
            where: { userId }
        });

        if (!twoFactorRecord) {
            return res.status(400).json({ message: 'No 2FA secret found. Please generate one first.' });
        }

        const secret = twoFactorRecord.secret;

        // Verify TOTP code
        const totp = new OTPAuth.TOTP({
            issuer: 'LPK PB Merdeka',
            label: req.user?.email || '',
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(secret),
        });

        const isValid = totp.validate({ token: code, window: 1 }) !== null;

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Generate 10 backup codes
        const backupCodes = Array.from({ length: 10 }, () =>
            Math.random().toString(36).substr(2, 8).toUpperCase()
        );

        // Enable 2FA using Prisma transaction to ensure consistency
        await prisma.$transaction([
            prisma.twoFactor.update({
                where: { userId },
                data: {
                    enabled: true,
                    backupCodes: JSON.stringify(backupCodes)
                }
            }),
            prisma.user.update({
                where: { id: userId },
                data: { twoFactorEnabled: true }
            })
        ]);

        return res.status(200).json({
            success: true,
            message: '2FA enabled successfully',
            backupCodes
        });
    } catch (error) {
        console.error('2FA enable error:', error);
        return res.status(500).json({ message: 'Error enabling 2FA' });
    }
}

export default checkAuth(handler);
