import { Router } from 'express'
import ping from './ping'
import authRoutes from '../../auth/auth-routes'

const router = Router()

router.use('/ping', ping)
router.use('/auth', authRoutes)

export default router
