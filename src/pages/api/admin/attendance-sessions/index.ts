import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { checkAdmin, AuthenticatedRequest } from '@/lib/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            // Lazy Expiration Check: Deactivate sessions where end_time has passed
            const activeSessions = await prisma.attendance_sessions.findMany({
                where: { is_active: true }
            });

            const now = new Date();
            const updates = [];

            for (const session of activeSessions) {
                // Construct full end datetime
                const sessionDate = new Date(session.date);
                const endTime = new Date(session.end_time);

                const expiry = new Date(sessionDate);
                expiry.setUTCHours(endTime.getUTCHours(), endTime.getUTCMinutes(), endTime.getUTCSeconds());

                const expireDate = new Date(session.date);
                const timePart = new Date(session.end_time);

                expireDate.setHours(timePart.getHours(), timePart.getMinutes(), timePart.getSeconds());

                const year = session.date.getFullYear();
                const month = session.date.getMonth();
                const day = session.date.getDate();
                const hours = session.end_time.getHours();
                const minutes = session.end_time.getMinutes();

                const combined = new Date(year, month, day, hours, minutes);

                if (now > combined) {
                    updates.push(
                        prisma.attendance_sessions.update({
                            where: { id: session.id },
                            data: { is_active: false }
                        })
                    );
                }
            }

            if (updates.length > 0) {
                await Promise.all(updates);
            }

            const sessions = await prisma.attendance_sessions.findMany({
                orderBy: { date: 'desc' },
            });

            const serialized = sessions.map((s: any) => ({
                ...s,
                id: s.id.toString(),
                date: s.date.toISOString(),
                start_time: s.start_time.toISOString(),
                end_time: s.end_time.toISOString(),
                created_at: s.created_at?.toISOString()
            }));

            return res.status(200).json(serialized);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error fetching sessions' });
        }
    }

    if (req.method === 'POST') {
        const { title, date, start_time, end_time, is_active } = req.body;

        if (!title || !date || !start_time || !end_time) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            // Parse date as UTC noon to safely avoid timezone shifts
            const dateObj = new Date(date + 'T12:00:00Z');

            // Parse time as local time (no Z suffix to avoid UTC conversion)
            const startObj = new Date(`1970-01-01T${start_time}:00`);
            const endObj = new Date(`1970-01-01T${end_time}:00`);

            const newSession = await prisma.attendance_sessions.create({
                data: {
                    title,
                    date: dateObj,
                    start_time: startObj,
                    end_time: endObj,
                    is_active: is_active ?? true,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });

            return res.status(201).json({
                message: 'Session created',
                session: { ...newSession, id: newSession.id.toString() }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error creating session' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}

export default checkAdmin(handler as any);
