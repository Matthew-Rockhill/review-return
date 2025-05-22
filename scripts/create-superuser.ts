const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperUser() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Super Admin';

  if (!email || !password) {
    console.error('Please provide email and password');
    console.log('Usage: npx ts-node scripts/create-superuser.ts <email> <password> [name]');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error('User with this email already exists');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        profile: {
          create: {
            role: 'admin',
          },
        },
      },
    });

    console.log('Superuser created successfully:');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating superuser:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperUser(); 