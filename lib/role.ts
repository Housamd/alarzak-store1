import { getServerSession } from 'next-auth'
import { authOptions } from './authOptions'

export async function getCurrentRole(): Promise<'retail' | 'wholesale'> {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (user?.role === 'WHOLESALE') return 'wholesale'
    return 'retail'
  } catch (e) {
    console.error('getCurrentRole error', e)
    return 'retail'
  }
}
