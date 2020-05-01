import { Router } from 'express'
import ping from './ping'
import authRoutes from '../../auth/authRoutes'
import userRoutes from '../../user/userRoutes'

const router = Router()

router.use('/ping', ping)
router.use('/auth', authRoutes)
router.use('/user', userRoutes)

export default router
