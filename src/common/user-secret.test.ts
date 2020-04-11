import * as E from 'fp-ts/lib/Either'
import { secretIsValidOrError } from './user-secret'

const weakSecrets = [
  'asdv',
  'password',
  '1234567'
]

const validSecrets = [
  'asdfghjk',
  'password1',
  'thisShould-TrichechusManatus-be/pretty/DECENT_äö123'
]

describe('Password validation fails for terribly weak ones but passes for slightly better ones', () => {
  it('Asserts that weak passwords fail the validation', () => {
    weakSecrets.forEach((secret) => {
      const either = secretIsValidOrError(secret)

      expect(E.isLeft(either)).toBeTruthy
    })
  })

  it('Asserts that slightly stronger passwords pass the validation', () => {
    validSecrets.forEach((secret) => {
      const either = secretIsValidOrError(secret)

      expect(E.isRight(either)).toBeTruthy
    })
  })
})
