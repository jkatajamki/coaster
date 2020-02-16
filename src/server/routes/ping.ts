import { Router } from 'express'

const router = Router()

router.get('/', (_, res) => {
  res.status(200).json({
    status: 'Ok',
    uptime: process.uptime(),
  })
})

export default router
