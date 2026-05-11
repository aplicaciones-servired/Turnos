import { Router } from 'express'
import { VendedoresController } from '@/Controllers/Vendedores.Controller'

const VendedoresRoutes = Router()

VendedoresRoutes.get('/vendedores', VendedoresController)

export default VendedoresRoutes