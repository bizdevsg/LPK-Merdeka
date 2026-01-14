import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { checkAuth, AuthenticatedRequest } from '@/lib/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id || Array.isArray(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    const sessionId = BigInt(id);
    const userId = req.user!.id; // Verified by checkAuth

    try {
        // 1. Check if session exists and is active
        const session = await prisma.attendance_sessions.findUnique({
            where: { id: sessionId }
        });
        if (!session || !session.isActive) {
            return res.status(400).json({ message: 'Sesi tidak tersedia' });
        }

        // 2. Check duplicate
        const existing = await prisma.attendance_records.findFirst({
            where: {
                userId: userId,
                attendanceSessionId: sessionId
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Anda sudah absen di sesi ini' });
        }

        // 3. Create Record
        const record = await prisma.attendance_records.create({
            data: {
                userId: userId,
                attendanceSessionId: sessionId,
                checkInTime: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        return res.status(200).json({
            message: 'Berhasil Check-in!',
            check_in_time: record.checkInTime.toISOString()
        });

    } catch (error) {
        console.error('Check-in error:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan sistem' });
    }
}

export default checkAuth(handler as any);
