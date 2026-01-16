import { PrismaClient } from '@prisma/client';

// Define constants inline instead of importing
const GameConstants = {
    POINTS: {
        VIDEO_WATCH: 50,
        EBOOK_READ: 30,
        QUIZ_CORRECT_ANSWER: 10,
        QUIZ_PERFECT_SCORE_BONUS: 50,
        DAILY_LOGIN: 10
    },
    LEVELING: {
        XP_PER_LEVEL: 500
    },
    CERTIFICATES: {
        PASSING_SCORE: 70
    }
};


const prisma = new PrismaClient() as any;

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Create Folders for Videos and E-Books
    console.log('📁 Creating folders...');

    const videoFolder1 = await prisma.content_folders.upsert({
        where: { id: BigInt(1) },
        update: {},
        create: {
            name: 'Dasar-Dasar Pasar Modal',
            type: 'video'
        }
    });

    const videoFolder2 = await prisma.content_folders.upsert({
        where: { id: BigInt(2) },
        update: {},
        create: {
            name: 'Analisis Teknikal',
            type: 'video'
        }
    });

    const ebookFolder1 = await prisma.content_folders.upsert({
        where: { id: BigInt(3) },
        update: {},
        create: {
            name: 'Panduan Investasi',
            type: 'ebook'
        }
    });

    const ebookFolder2 = await prisma.content_folders.upsert({
        where: { id: BigInt(4) },
        update: {},
        create: {
            name: 'Regulasi Pasar Modal',
            type: 'ebook'
        }
    });

    // 2. Create Videos
    console.log('🎥 Creating videos...');

    const videos = [
        {
            id: BigInt(1),
            title: 'Pengenalan Pasar Modal Indonesia',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: 1200,
            description: 'Video pengenalan tentang pasar modal Indonesia dan instrumen-instrumennya',
            folder_id: videoFolder1.id,
            cover_url: null
        },
        {
            id: BigInt(2),
            title: 'Cara Membaca Candlestick Chart',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: 900,
            description: 'Panduan lengkap membaca dan menganalisis candlestick chart',
            folder_id: videoFolder2.id,
            cover_url: null
        },
        {
            id: BigInt(3),
            title: 'Strategi Trading untuk Pemula',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: 1500,
            description: 'Strategi trading yang cocok untuk investor pemula',
            folder_id: videoFolder2.id,
            cover_url: null
        }
    ];

    for (const video of videos) {
        await prisma.videos.upsert({
            where: { id: video.id },
            update: {},
            create: video
        });
    }

    // 3. Create E-Books
    console.log('📚 Creating e-books...');

    const ebooks = [
        // Panduan Investasi Folder
        {
            id: BigInt(1),
            title: 'Panduan Lengkap Investasi Saham',
            file_url: '/uploads/ebooks/panduan-saham.pdf',
            description: 'Buku panduan lengkap untuk memulai investasi saham dari nol',
            folder_id: ebookFolder1.id,
            cover_url: null
        },
        {
            id: BigInt(2),
            title: 'Memahami Laporan Keuangan Perusahaan',
            file_url: '/uploads/ebooks/laporan-keuangan.pdf',
            description: 'Cara membaca dan menganalisis laporan keuangan untuk investasi',
            folder_id: ebookFolder1.id,
            cover_url: null
        },
        {
            id: BigInt(3),
            title: 'Strategi Diversifikasi Portfolio',
            file_url: '/uploads/ebooks/diversifikasi-portfolio.pdf',
            description: 'Panduan praktis membangun portfolio investasi yang terdiversifikasi',
            folder_id: ebookFolder1.id,
            cover_url: null
        },
        {
            id: BigInt(4),
            title: 'Investasi Jangka Panjang vs Jangka Pendek',
            file_url: '/uploads/ebooks/investasi-jangka-waktu.pdf',
            description: 'Memahami perbedaan dan strategi investasi berdasarkan jangka waktu',
            folder_id: ebookFolder1.id,
            cover_url: null
        },
        {
            id: BigInt(5),
            title: 'Manajemen Risiko dalam Investasi',
            file_url: '/uploads/ebooks/manajemen-risiko.pdf',
            description: 'Teknik dan strategi mengelola risiko dalam berinvestasi',
            folder_id: ebookFolder1.id,
            cover_url: null
        },
        // Regulasi Pasar Modal Folder
        {
            id: BigInt(6),
            title: 'Peraturan OJK tentang Pasar Modal',
            file_url: '/uploads/ebooks/regulasi-ojk.pdf',
            description: 'Kumpulan peraturan OJK yang perlu diketahui investor',
            folder_id: ebookFolder2.id,
            cover_url: null
        },
        {
            id: BigInt(7),
            title: 'Hak dan Kewajiban Investor',
            file_url: '/uploads/ebooks/hak-kewajiban-investor.pdf',
            description: 'Panduan lengkap tentang hak dan kewajiban sebagai investor',
            folder_id: ebookFolder2.id,
            cover_url: null
        },
        {
            id: BigInt(8),
            title: 'Mekanisme Perdagangan Efek',
            file_url: '/uploads/ebooks/mekanisme-perdagangan.pdf',
            description: 'Memahami mekanisme dan aturan perdagangan efek di bursa',
            folder_id: ebookFolder2.id,
            cover_url: null
        },
        {
            id: BigInt(9),
            title: 'Perlindungan Investor di Pasar Modal',
            file_url: '/uploads/ebooks/perlindungan-investor.pdf',
            description: 'Sistem perlindungan investor dan lembaga yang terkait',
            folder_id: ebookFolder2.id,
            cover_url: null
        },
        {
            id: BigInt(10),
            title: 'Etika dan Tata Kelola Perusahaan Publik',
            file_url: '/uploads/ebooks/etika-tata-kelola.pdf',
            description: 'Prinsip good corporate governance untuk perusahaan publik',
            folder_id: ebookFolder2.id,
            cover_url: null
        }
    ];

    for (const ebook of ebooks) {
        await prisma.ebooks.upsert({
            where: { id: ebook.id },
            update: {},
            create: ebook
        });
    }

    console.log(`✅ Created ${ebooks.length} e-books`);

    // 4. Create Quiz Categories
    console.log('📋 Creating quiz categories...');

    const categories = [
        {
            id: BigInt(1),
            name: 'Dasar Pasar Modal',
            description: 'Kategori untuk kuis dasar-dasar pasar modal'
        },
        {
            id: BigInt(2),
            name: 'Analisis Teknikal',
            description: 'Kategori untuk kuis analisis teknikal'
        },
        {
            id: BigInt(3),
            name: 'Regulasi & Compliance',
            description: 'Kategori untuk kuis regulasi dan kepatuhan'
        }
    ];

    for (const category of categories) {
        await prisma.quiz_categories.upsert({
            where: { id: category.id },
            update: {},
            create: category
        });
    }

    // 5. Create Weekly Quizzes (without questions - questions should be added via admin panel)
    console.log('🎯 Creating quizzes...');

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Quiz 1: Active Quiz (Current)
    await prisma.weekly_quizzes.upsert({
        where: { id: BigInt(1) },
        update: {},
        create: {
            title: 'Kuis Mingguan: Pengenalan Pasar Modal',
            category_id: BigInt(1),
            start_date: lastWeek,
            end_date: nextWeek,
            is_active: true
        }
    });

    // Quiz 2: Upcoming Quiz
    await prisma.weekly_quizzes.upsert({
        where: { id: BigInt(2) },
        update: {},
        create: {
            title: 'Kuis Mingguan: Analisis Teknikal Dasar',
            category_id: BigInt(2),
            start_date: now,
            end_date: nextWeek,
            is_active: true
        }
    });

    console.log('⚠️  Note: Quiz questions should be added via Admin Panel (Quiz Bank)');

    // 6. Get existing users and create gamification profiles
    console.log('👥 Creating gamification profiles for existing users...');

    const users = await prisma.user.findMany({
        select: { id: true, name: true }
    });

    if (users.length > 0) {
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const basePoints = 1000 - (i * 100); // Decreasing points for variety
            const level = Math.floor(basePoints / GameConstants.LEVELING.XP_PER_LEVEL) + 1;

            await prisma.gamification_profile.upsert({
                where: { user_id: user.id },
                update: {},
                create: {
                    user_id: user.id,
                    total_points: basePoints,
                    level: level
                }
            });

            // Create sample gamification logs
            const sampleLogs = [
                {
                    user_id: user.id,
                    action_type: 'quiz',
                    action_id: 'quiz_1',
                    points: 100
                },
                {
                    user_id: user.id,
                    action_type: 'video_watch',
                    action_id: '1',
                    points: GameConstants.POINTS.VIDEO_WATCH
                },
                {
                    user_id: user.id,
                    action_type: 'ebook_read',
                    action_id: '1',
                    points: GameConstants.POINTS.EBOOK_READ
                }
            ];

            for (const log of sampleLogs) {
                await prisma.gamification_logs.create({
                    data: log
                });
            }

            console.log(`✅ Created gamification profile for user: ${user.name} (${basePoints} XP, Level ${level})`);
        }

        console.log(`\n📊 Summary:`);
        console.log(`   - Created ${users.length} gamification profiles`);
        console.log(`   - Created ${users.length * 3} sample activity logs`);
        console.log(`   - Top user: ${users[0].name} with 1000 XP (Level 3)`);
    } else {
        console.log('⚠️  No users found in database. Please create users first.');
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Add quiz questions via Admin Panel → Quiz Bank');
    console.log('   2. Test gamification by watching videos and reading ebooks');
    console.log('   3. Check leaderboard to see user rankings');
    console.log('   4. Complete quizzes to earn certificates');
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
