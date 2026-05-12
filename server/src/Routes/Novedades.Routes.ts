import { Router } from 'express';
import NovedadesController from '@/Controllers/Novedades.Controller';

const router = Router();

// Obtener todas las novedades
router.get('/novedades', NovedadesController.getAllNovedades);

// Obtener novedad por ID
router.get('/novedades/:id', NovedadesController.getNovedadById);

// Obtener novedades por vendedor
router.get('/novedades/vendedor/:vendedorDocumento', NovedadesController.getNovedadesByVendedor);

// Obtener novedad por ticket
router.get('/novedades/tk/:ticket', NovedadesController.getNovedadByTicket);

// Obtener novedades por tipo
router.get('/novedades/tipo/:tipo', NovedadesController.getNovedadesByTipo);

// Obtener novedades por mes
router.get('/novedades/mes/:mes/:anio', NovedadesController.getNovedadesByMes);

// Crear nueva novedad
router.post('/novedades', NovedadesController.createNovedad);

// Actualizar novedad
router.put('/novedades/:id', NovedadesController.updateNovedad);

// Eliminar novedad
router.delete('/novedades/:id', NovedadesController.deleteNovedad);

export default router;
