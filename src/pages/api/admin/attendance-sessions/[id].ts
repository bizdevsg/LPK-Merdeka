import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { checkAdmin, AuthenticatedRequest } from '@/lib/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    const sessionId = BigInt(id);

    if (req.method === 'GET') {
        try {
            const session = await prisma.attendance_sessions.findUnique({
                where: { id: sessionId }
            });

            if (!session) return res.status(404).json({ message: 'Session not found' });

            return res.status(200).json({
                ...session,
                id: session.id.toString(),
                date: session.date.toISOString(),
                start_time: session.startTime.toISOString(),
                end_time: session.endTime.toISOString(),
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching session' });
        }
    }

    if (req.method === 'PUT') {
        const { title, date, start_time, end_time, is_active } = req.body;

        try {
            const updateData: any = {
                updatedAt: new Date()
            };

            if (title) updateData.title = title;
            // Use UTC noon to avoid date shifting
            if (date) updateData.date = new Date(date + 'T12:00:00Z');
            // Use UTC to preserve Wall Clock time
            if (start_time) updateData.startTime = new Date(`1970-01-01T${start_time}:00Z`);
            if (end_time) updateData.endTime = new Date(`1970-01-01T${end_time}:00Z`);
            if (is_active !== undefined) updateData.isActive = is_active;

            const session = await prisma.attendance_sessions.update({
                where: { id: sessionId },
                data: updateData
            });

            return res.status(200).json({
                message: 'Session updated',
                session: { ...session, id: session.id.toString() }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error updating session' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await prisma.attendance_sessions.delete({
                where: { id: sessionId }
            });
            return res.status(200).json({ message: 'Session deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error deleting session' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}

export default checkAdmin(handler as any);
