import { Router } from 'express'
import { signUpOrSendError, signInOrSendError } from './auth'

const router = Router()

export interface SignUpRequest {
  email: string
  userSecret: string
}

export interface SignInRequest {
  loginWord: string
  userSecret: string
}

router.post('/signUp', (req, res) => {
  const { body: { email, userSecret } } = req

  return signUpOrSendError(req, res)({ email, userSecret })
})

router.post('/signIn', (req, res) => {
  const { body: { loginWord, userSecret } } = req

  return signInOrSendError(req, res)({ loginWord, userSecret })
})

export default router
