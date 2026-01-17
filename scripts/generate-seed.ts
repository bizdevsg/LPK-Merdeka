import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log("Generating seed from current database...");

    const fmt = (val: any): string => {
        if (val === null) return 'null';
        if (typeof val === 'bigint') return `BigInt(${val.toString()})`;
        if (typeof val === 'string') return JSON.stringify(val);
        if (val instanceof Date) return `new Date('${val.toISOString()}')`;
        if (Array.isArray(val)) return JSON.stringify(val);
        if (typeof val === 'object') return JSON.stringify(val); // JSON objects
        return String(val);
    };

    const generateSection = async (modelName: string) => {
        // @ts-ignore
        const data = await prisma[modelName].findMany();
        if (data.length === 0) return `    // No data for ${modelName}\n`;

        let section = `    // ${modelName} (${data.length} records)\n`;
        section += `    console.log('Seeding ${modelName}...');\n`;
        section += `    const ${modelName}_data = [\n`;

        data.forEach((row: any) => {
            section += `        {\n`;
            Object.keys(row).forEach(key => {
                section += `            ${key}: ${fmt(row[key])},\n`;
            });
            section += `        },\n`;
        });
        section += `    ];\n\n`;

        section += `    await prisma.${modelName}.createMany({\n`;
        section += `        data: ${modelName}_data,\n`;
        section += `        skipDuplicates: true\n`;
        section += `    });\n\n`;

        return section;
    };

    let content = `import { PrismaClient } from '@prisma/client';\n\nconst prisma = new PrismaClient() as any;\n\nasync function main() {\n`;

    // Order matters (Dependencies)
    const tables = [
        'user',
        'account', // OAuth accounts
        'content_folders',
        'cms_settings',
        'cms_faq',
        'cms_gallery',
        'cms_testimonials',
        'cms_articles',
        'videos',
        'ebooks',
        'quiz_categories',
        'question_types',
        'question_bank',
        'weekly_quizzes',
        'quiz_question_order',
        'quiz_attempts',
        'gamification_profile',
        'gamification_logs',
        'certificates',
        'attendance_sessions',
        'attendance_records'
    ];

    for (const table of tables) {
        try {
            content += await generateSection(table);
        } catch (e) {
            console.warn(`Skipping table ${table} due to error or missing model:`, e);
            content += `    // Failed to dump ${table}\n`;
        }
    }

    content += `    console.log('✅ Seed completed!');\n`;
    content += `}\n\nmain().catch(e => {\n    console.error(e);\n    process.exit(1);\n}).finally(async () => {\n    await prisma.$disconnect();\n});\n`;

    fs.writeFileSync('prisma/seed.ts', content);
    console.log("prisma/seed.ts has been updated with current DB data.");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
