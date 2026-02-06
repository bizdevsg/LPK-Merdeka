import type { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { checkAdmin, AuthenticatedRequest } from '@/lib/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // User Statistics
        const totalUsers = await prisma.user.count();
        const totalAdmins = await prisma.user.count({
            where: {
                OR: [
                    { role: 'admin' },
                    { role: 'superAdmin' }
                ]
            }
        });

        // Attendance Statistics
        const activeSessions = await prisma.attendance_sessions.count({
            where: { isActive: true }
        });
        const totalAttendanceRecords = await prisma.attendance_records.count();

        // CMS Statistics
        const totalGallery = await prisma.cms_gallery.count();
        const totalFAQ = await prisma.cms_faq.count();
        const totalTestimonials = await prisma.cms_testimonials.count();
        const totalArticles = await prisma.cms_articles.count();

        // Learning Content Statistics
        const totalEbooks = await (prisma as any).ebooks.count();
        const totalVideos = await (prisma as any).videos.count();

        // Check Database Connection
        let dbStatus = 'Terhubung';
        try {
            await prisma.$queryRaw`SELECT 1`;
        } catch (e) {
            dbStatus = 'Terputus';
        }

        return res.status(200).json({
            users: {
                total: totalUsers,
                admins: totalAdmins
            },
            attendance: {
                activeSessions,
                totalRecords: totalAttendanceRecords
            },
            cms: {
                gallery: totalGallery,
                faq: totalFAQ,
                testimonials: totalTestimonials,
                articles: totalArticles
            },
            content: {
                ebooks: totalEbooks,
                videos: totalVideos
            },
            system: {
                database: dbStatus,
                api: 'Terhubung',
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        return res.status(500).json({ message: 'Error fetching statistics' });
    }
}

export default checkAdmin(handler as any);
