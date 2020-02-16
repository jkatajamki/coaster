import { Router } from 'express'
import ping from './ping'

export const router = Router()

router.use('/ping', ping)
