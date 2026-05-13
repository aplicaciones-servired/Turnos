import { Router } from 'express';
import CalculoHorasController from '@/Controllers/CalculoHoras.Controller';

const router = Router();

// Generar cálculo de nómina para un vendedor
router.post('/calculo-horas', CalculoHorasController.generarCalculo);

// Obtener cálculos de un período (mes/año)
router.get('/calculo-horas/periodo/:mes/:anio', CalculoHorasController.obtenerCalculosPeriodo);

// Obtener cálculo específico de vendedor
router.get(
  '/calculo-horas/:vendedorDocumento/:mes/:anio',
  CalculoHorasController.obtenerCalculoVendedor
);

// Preview sin guardar (útil para validar antes de guardar)
router.get('/calculo-horas-preview', CalculoHorasController.previewCalculo);

// Cambiar estado de cálculo (borrador -> procesado -> pagado)
router.put('/calculo-horas/:id/estado', CalculoHorasController.cambiarEstado);

export default router;
