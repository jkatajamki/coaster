import { Router } from 'express'
import { signUpOrSendError } from './auth'

const router = Router()

export interface SignUpRequest {
  email: string
  userSecret: string
}

router.post('/signUp', (req, res) => {
  const { body: { email, userSecret } } = req

  return signUpOrSendError(req, res)({ email, userSecret })
})

export default router
