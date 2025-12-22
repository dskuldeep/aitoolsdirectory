import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@agitracker.io'
  const password = 'admin123'
  const hashedPassword = await hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      email,
      name: 'Admin User',
      role: 'admin',
      password: hashedPassword,
    },
  })

  console.log('Admin user created/updated:', {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    hasPassword: !!admin.password,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

