import { Router } from 'express';
import TarifasController from '@/Controllers/Tarifas.Controller';

const router = Router();

// Obtener todas las tarifas
router.get('/tarifas', TarifasController.getAllTarifas);

// Obtener tarifa por ID
router.get('/tarifas/:id', TarifasController.getTarifaById);

// Obtener tarifas por sucursal
router.get('/tarifas/sucursal/:sucursalesId', TarifasController.getTarifasBySucursal);

// Crear nueva tarifa
router.post('/tarifas', TarifasController.createTarifa);

// Actualizar tarifa
router.put('/tarifas/:id', TarifasController.updateTarifa);

// Eliminar tarifa
router.delete('/tarifas/:id', TarifasController.deleteTarifa);

export default router;
