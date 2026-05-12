import { Router } from 'express'
import { SucursalesController } from '@/Controllers/Sucursales.Controller'

const SucursalesRoutes = Router()

SucursalesRoutes.get('/sucursales', SucursalesController)

export default SucursalesRoutes