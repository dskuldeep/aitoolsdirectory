import { type NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { z } from 'zod'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authOptions: NextAuthOptions = {
  // Only use adapter for OAuth providers, not for credentials
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const parsed = credentialsSchema.parse(credentials)
          const user = await prisma.user.findUnique({
            where: { email: parsed.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              role: true,
              password: true, // Explicitly select password field
            },
          })

          if (!user) {
            console.log('User not found:', parsed.email)
            return null
          }

          // For OAuth users, password won't exist
          if (!user.password) {
            console.log('User has no password:', parsed.email)
            return null
          }

          // Verify password with bcrypt
          const isValid = await compare(parsed.password, user.password)
          if (!isValid) {
            console.log('Invalid password for:', parsed.email)
            return null
          }

          console.log('Authentication successful for:', parsed.email)
          
          // Return user object with all required fields
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || user.email,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token, user, account: _account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'user'
      }
      // On subsequent requests, refresh role from database if needed
      if (token.id && !token.role) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: parseInt(token.id as string) },
            select: { role: true },
          })
          if (dbUser) {
            token.role = dbUser.role
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

