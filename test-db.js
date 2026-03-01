const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        await prisma.user.create({ data: { email: 'test4@example.com', name: 'test4' } });
    } catch (e) {
        fs.writeFileSync('error_log.txt', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
