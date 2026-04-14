import express from 'express'
import { userdata } from '../controler/userData.js'
import userAuth from '../service/middleware/userAuth.js'

const router=express.Router()

router.get('/userData',userAuth,userdata)
export default router