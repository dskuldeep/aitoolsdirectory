import { PrismaClient } from '@prisma/client'
import { compare, hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@example.com'
  const password = 'admin123'

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
    },
  })

  if (!user) {
    console.log('❌ User not found')
    return
  }

  console.log('✅ User found:', {
    id: user.id,
    email: user.email,
    role: user.role,
    hasPassword: !!user.password,
    passwordLength: user.password?.length,
  })

  if (!user.password) {
    console.log('❌ User has no password, creating one...')
    const hashedPassword = await hash(password, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })
    console.log('✅ Password created')
    return
  }

  console.log('\n🔐 Testing password verification...')
  const isValid = await compare(password, user.password)
  console.log('Password match:', isValid ? '✅ YES' : '❌ NO')

  if (!isValid) {
    console.log('\n🔄 Updating password...')
    const newHashedPassword = await hash(password, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHashedPassword },
    })
    console.log('✅ Password updated, testing again...')
    const newUser = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    })
    if (newUser?.password) {
      const isValidAfter = await compare(password, newUser.password)
      console.log('Password match after update:', isValidAfter ? '✅ YES' : '❌ NO')
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

