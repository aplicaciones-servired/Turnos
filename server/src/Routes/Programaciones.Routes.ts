import { Router } from 'express';
import ProgramacionesController from '@/Controllers/Programaciones.Controller';

const router = Router();

// Obtener todas las programaciones
router.get('/programaciones', ProgramacionesController.getAllProgramaciones);

// Obtener programación por ID
router.get('/programaciones/:id', ProgramacionesController.getProgramacionById);

// Obtener programaciones por vendedor
router.get('/programaciones/vendedor/:vendedorDocumento', ProgramacionesController.getProgramacionesByVendedor);

// Obtener programaciones por sucursal
router.get('/programaciones/sucursal/:sucursalesId', ProgramacionesController.getProgramacionesBySucursal);

// Obtener programaciones por mes
router.get('/programaciones/mes/:mes/:anio', ProgramacionesController.getProgramacionesByMes);

// Crear nueva programación
router.post('/programaciones', ProgramacionesController.createProgramacion);

// Actualizar programación
router.put('/programaciones/:id', ProgramacionesController.updateProgramacion);

// Eliminar programación
router.delete('/programaciones/:id', ProgramacionesController.deleteProgramacion);

export default router;
