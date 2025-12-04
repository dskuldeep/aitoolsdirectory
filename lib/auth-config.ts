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
        console.log('[JWT] Initial sign in, setting role:', token.role)
      }
      // On subsequent requests, only refresh role if it's missing
      // Don't query DB on every request to avoid connection issues in serverless
      if (token.id && !token.role) {
        try {
          const userId = typeof token.id === 'string' ? parseInt(token.id) : token.id
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          })
          if (dbUser) {
            token.role = dbUser.role
          } else {
            token.role = 'user' // Default fallback
          }
        } catch (error) {
          console.error('[JWT] Error fetching user role:', error)
          // Default to 'user' on error if role is missing
          if (!token.role) {
            token.role = 'user'
          }
        }
      }

      // Ensure role is always set
      if (!token.role) {
        token.role = 'user'
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

