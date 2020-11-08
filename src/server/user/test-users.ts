import { UserSecrets } from '../auth/cryptography'
import { User } from '../../common/user/User'

export const testUsers: User[] = [
  {
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'email@taken.com',
  },
  {
    userId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'also@taken.com',
  },
  {
    userId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'definitely@taken.com',
  },
  {
    userId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'very@existent.com',
  },
  {
    userId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'insubitably@existent.email',
  },
]

export const testUserSecrets: UserSecrets = { passwordHash: 'hash' }
