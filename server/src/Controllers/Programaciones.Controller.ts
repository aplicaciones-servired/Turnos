import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Programacion from '@/Models/Programacion';
import Turno from '@/Models/Turno';

class ProgramacionesController {
  // Obtener todas las programaciones
  async getAllProgramaciones(req: Request, res: Response): Promise<void> {
    try {
      const programaciones = await Programacion.findAll({
        include: [
          { model: Turno, as: 'turno' },
        ],
      });
      res.status(200).json({ success: true, data: programaciones });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Obtener programación por ID
  async getProgramacionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const programacion = await Programacion.findByPk(id, {
        include: [
          { model: Turno, as: 'turno' },
        ],
      });
      if (!programacion) {
        res.status(404).json({ success: false, error: 'Programación no encontrada' });
        return;
      }
      res.status(200).json({ success: true, data: programacion });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Obtener programaciones por vendedor
  async getProgramacionesByVendedor(req: Request, res: Response): Promise<void> {
    try {
      const { vendedorDocumento } = req.params;
      const programaciones = await Programacion.findAll({
        where: { vendedorDocumento },
        include: [
          { model: Turno, as: 'turno' },
        ],
      });
      res.status(200).json({ success: true, data: programaciones });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Obtener programaciones por sucursal
  async getProgramacionesBySucursal(req: Request, res: Response): Promise<void> {
    try {
      const { sucursalesId } = req.params;
      const programaciones = await Programacion.findAll({
        where: { sucursalesId },
        include: [
          { model: Turno, as: 'turno' },
        ],
      });
      res.status(200).json({ success: true, data: programaciones });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Obtener programaciones por fecha/mes
  async getProgramacionesByMes(req: Request, res: Response): Promise<void> {
    try {
      const { mes, anio } = req.params as { mes: string; anio: string };
      const startDate = new Date(`${anio}-${mes.padStart(2, '0')}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      const programaciones = await Programacion.findAll({
        where: {
          fecha: { [Op.between]: [startDate, endDate] },
        },
        include: [
          { model: Turno, as: 'turno' },
        ],
      });
      res.status(200).json({ success: true, data: programaciones });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Crear nueva programación
  async createProgramacion(req: Request, res: Response): Promise<void> {
    try {
      const { vendedorDocumento, turnoId, fecha, sucursalesId, semanaNumero, secuencia, horasProgramadas, aplicaHoraExtra } = req.body;

      if (!vendedorDocumento || !turnoId || !fecha) {
        res.status(400).json({ success: false, error: 'Campos requeridos: vendedorDocumento, turnoId, fecha' });
        return;
      }

      const programacion = await Programacion.create({
        vendedorDocumento,
        turnoId,
        fecha,
        sucursalesId,
        semanaNumero,
        secuencia,
        horasProgramadas,
        aplicaHoraExtra,
      });
      res.status(201).json({ success: true, data: programacion, message: 'Programación creada exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Actualizar programación
  async updateProgramacion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { vendedorDocumento, turnoId, fecha, sucursalesId, semanaNumero, secuencia, horasProgramadas, aplicaHoraExtra } = req.body;

      const programacion = await Programacion.findByPk(id);
      if (!programacion) {
        res.status(404).json({ success: false, error: 'Programación no encontrada' });
        return;
      }

      await programacion.update({
        vendedorDocumento,
        turnoId,
        fecha,
        sucursalesId,
        semanaNumero,
        secuencia,
        horasProgramadas,
        aplicaHoraExtra,
      });
      res.status(200).json({ success: true, data: programacion, message: 'Programación actualizada exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Eliminar programación
  async deleteProgramacion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const programacion = await Programacion.findByPk(id);
      if (!programacion) {
        res.status(404).json({ success: false, error: 'Programación no encontrada' });
        return;
      }

      await programacion.destroy();
      res.status(200).json({ success: true, message: 'Programación eliminada exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }
}

export default new ProgramacionesController();
