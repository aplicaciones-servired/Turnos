import { Router } from 'express';
import TurnosController from '@/Controllers/Turnos.Controller';

const router = Router();

// Obtener todos los turnos
router.get('/turnos', TurnosController.getAllTurnos);

// Obtener turno por ID
router.get('/turnos/:id', TurnosController.getTurnoById);

// Crear nuevo turno
router.post('/turnos', TurnosController.createTurno);

// Actualizar turno
router.put('/turnos/:id', TurnosController.updateTurno);

// Eliminar turno
router.delete('/turnos/:id', TurnosController.deleteTurno);

export default router;
