import { User } from './user';

export default (): User[] => [
  {
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'email@taken.com',
    userSecret: 'asdfasfasdfasdf',
    salt: 'qwerqwert'
  },
  {
    userId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'also@taken.com',
    userSecret: 'asdfasfasdfasdf',
    salt: 'qwerqwert'
  },
  {
    userId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'definitely@taken.com',
    userSecret: 'asdfasfasdfasdf',
    salt: 'qwerqwert'
  },
  {
    userId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'very@existent.com',
    userSecret: 'asdfasfasdfasdf',
    salt: 'qwerqwert'
  },
  {
    userId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'insubitably@existent.email',
    userSecret: 'asdfasfasdfasdf',
    salt: 'qwerqwert'
  },
]
