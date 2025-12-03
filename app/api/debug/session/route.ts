import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const user = await getCurrentUser()

    return NextResponse.json({
      session: {
        user: session?.user,
        expires: session?.expires,
      },
      dbUser: user,
      token: (session as any)?.token,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

