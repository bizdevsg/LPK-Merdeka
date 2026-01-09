import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            // Lazy Expiration Check
            const activeSessions = await prisma.attendance_sessions.findMany({
                where: { is_active: true }
            });

            const now = new Date();
            const updates = [];

            for (const session of activeSessions) {
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

            // Fetch active sessions again (after updates)
            const sessions = await prisma.attendance_sessions.findMany({
                where: {
                    is_active: true,
                },
                orderBy: { date: 'desc' },
            });

            const serialized = sessions.map(s => ({
                ...s,
                id: s.id.toString(),
                date: s.date.toISOString(),
                start_time: s.start_time.toISOString(), // Contains dummy date part
                end_time: s.end_time.toISOString(),
                created_at: s.created_at?.toISOString()
            }));

            return res.status(200).json(serialized);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error fetching sessions' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
