import { Request, Response } from 'express';
import Turno from '@/Models/Turno';

class TurnosController {
  // Obtener todos los turnos
  async getAllTurnos(req: Request, res: Response): Promise<void> {
    try {
      const turnos = await Turno.findAll();
      res.status(200).json({ success: true, data: turnos });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Obtener turno por ID
  async getTurnoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const turno = await Turno.findByPk(Number(id));
      if (!turno) {
        res.status(404).json({ success: false, error: 'Turno no encontrado' });
        return;
      }
      res.status(200).json({ success: true, data: turno });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Crear nuevo turno
  async createTurno(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, horaInicio, horaFin, esNocturno } = req.body;

      if (!nombre || !horaInicio || !horaFin) {
        res.status(400).json({ success: false, error: 'Campos requeridos: nombre, horaInicio, horaFin' });
        return;
      }

      const turno = await Turno.create({ nombre, horaInicio, horaFin, esNocturno });
      res.status(201).json({ success: true, data: turno, message: 'Turno creado exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Actualizar turno
  async updateTurno(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { nombre, horaInicio, horaFin, esNocturno } = req.body;

      const turno = await Turno.findByPk(Number(id));
      if (!turno) {
        res.status(404).json({ success: false, error: 'Turno no encontrado' });
        return;
      }

      await turno.update({ nombre, horaInicio, horaFin, esNocturno });
      res.status(200).json({ success: true, data: turno, message: 'Turno actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Eliminar turno
  async deleteTurno(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const turno = await Turno.findByPk(Number(id));
      if (!turno) {
        res.status(404).json({ success: false, error: 'Turno no encontrado' });
        return;
      }

      await turno.destroy();
      res.status(200).json({ success: true, message: 'Turno eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }
}

export default new TurnosController();
