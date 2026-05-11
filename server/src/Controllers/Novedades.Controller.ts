import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Novedad from '@/Models/Novedad';
import Vendedor from '@/Models/Vendedor';

class NovedadesController {
  // Obtener todas las novedades
  async getAllNovedades(req: Request, res: Response): Promise<void> {
    try {
      const novedades = await Novedad.findAll({
        include: [{ model: Vendedor, as: 'vendedor' }],
      });
      res.status(200).json({ success: true, data: novedades });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Obtener novedad por ID
  async getNovedadById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const novedad = await Novedad.findByPk(Number(id), {
        include: [{ model: Vendedor, as: 'vendedor' }],
      });
      if (!novedad) {
        res.status(404).json({ success: false, error: 'Novedad no encontrada' });
        return;
      }
      res.status(200).json({ success: true, data: novedad });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Obtener novedades por vendedor
  async getNovedadesByVendedor(req: Request, res: Response): Promise<void> {
    try {
      const { vendedorDocumento } = req.params;
      const novedades = await Novedad.findAll({
        where: { vendedorDocumento },
        include: [{ model: Vendedor, as: 'vendedor' }],
      });
      res.status(200).json({ success: true, data: novedades });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Obtener novedades por tipo
  async getNovedadesByTipo(req: Request, res: Response): Promise<void> {
    try {
      const { tipo } = req.params;
      const tiposValidos = ['permiso', 'incapacidad', 'ausencia', 'otro'];
      if (!tiposValidos.includes(String(tipo))) {
        res.status(400).json({ success: false, error: `Tipo inválido. Tipos válidos: ${tiposValidos.join(', ')}` });
        return;
      }
      const novedades = await Novedad.findAll({
        where: { tipo },
        include: [{ model: Vendedor, as: 'vendedor' }],
      });
      res.status(200).json({ success: true, data: novedades });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Obtener novedades por fecha/mes
  async getNovedadesByMes(req: Request, res: Response): Promise<void> {
    try {
      const { mes, anio } = req.params as { mes: string; anio: string };
      const startDate = new Date(`${anio}-${mes.padStart(2, '0')}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      const novedades = await Novedad.findAll({
        where: {
          fecha: { [Op.between]: [startDate, endDate] },
        },
        include: [{ model: Vendedor, as: 'vendedor' }],
      });
      res.status(200).json({ success: true, data: novedades });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Crear nueva novedad
  async createNovedad(req: Request, res: Response): Promise<void> {
    try {
      const { vendedorDocumento, fecha, tipo, horas, incidenteNumero, descripcion } = req.body;

      if (!vendedorDocumento || !fecha || !tipo || horas === undefined) {
        res.status(400).json({ success: false, error: 'Campos requeridos: vendedorDocumento, fecha, tipo, horas' });
        return;
      }

      const tiposValidos = ['permiso', 'incapacidad', 'ausencia', 'otro'];
      if (!tiposValidos.includes(tipo)) {
        res.status(400).json({ success: false, error: `Tipo inválido. Tipos válidos: ${tiposValidos.join(', ')}` });
        return;
      }

      const novedad = await Novedad.create({
        vendedorDocumento,
        fecha,
        tipo,
        horas,
        incidenteNumero,
        descripcion,
      });
      res.status(201).json({ success: true, data: novedad, message: 'Novedad creada exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Actualizar novedad
  async updateNovedad(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { vendedorDocumento, fecha, tipo, horas, incidenteNumero, descripcion } = req.body;

      const novedad = await Novedad.findByPk(Number(id));
      if (!novedad) {
        res.status(404).json({ success: false, error: 'Novedad no encontrada' });
        return;
      }

      await novedad.update({
        vendedorDocumento,
        fecha,
        tipo,
        horas,
        incidenteNumero,
        descripcion,
      });
      res.status(200).json({ success: true, data: novedad, message: 'Novedad actualizada exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Eliminar novedad
  async deleteNovedad(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const novedad = await Novedad.findByPk(Number(id));
      if (!novedad) {
        res.status(404).json({ success: false, error: 'Novedad no encontrada' });
        return;
      }

      await novedad.destroy();
      res.status(200).json({ success: true, message: 'Novedad eliminada exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }
}

export default new NovedadesController();
