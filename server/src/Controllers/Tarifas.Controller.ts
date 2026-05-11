import { Request, Response } from 'express';
import Tarifa from '@/Models/Tarifa';

class TarifasController {
  // Obtener todas las tarifas
  async getAllTarifas(req: Request, res: Response): Promise<void> {
    try {
      const tarifas = await Tarifa.findAll();
      res.status(200).json({ success: true, data: tarifas });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Obtener tarifa por ID
  async getTarifaById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tarifa = await Tarifa.findByPk(Number(id));
      if (!tarifa) {
        res.status(404).json({ success: false, error: 'Tarifa no encontrada' });
        return;
      }
      res.status(200).json({ success: true, data: tarifa });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Obtener tarifas por sucursal
  async getTarifasBySucursal(req: Request, res: Response): Promise<void> {
    try {
      const { sucursalesId } = req.params;
      const tarifas = await Tarifa.findAll({ where: { sucursalesId } });
      res.status(200).json({ success: true, data: tarifas });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Crear nueva tarifa
  async createTarifa(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, valorHoraNormal, valorHoraExtraDiurna, valorHoraExtraNocturna, valorHoraExtraFestiva, recargoDiurnoPct, recargoNocturnoPct, sucursalesId } = req.body;

      if (!valorHoraNormal) {
        res.status(400).json({ success: false, error: 'Campo requerido: valorHoraNormal' });
        return;
      }

      const tarifa = await Tarifa.create({
        nombre,
        valorHoraNormal,
        valorHoraExtraDiurna,
        valorHoraExtraNocturna,
        valorHoraExtraFestiva,
        recargoDiurnoPct,
        recargoNocturnoPct,
        sucursalesId,
      });
      res.status(201).json({ success: true, data: tarifa, message: 'Tarifa creada exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Actualizar tarifa
  async updateTarifa(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, valorHoraNormal, valorHoraExtraDiurna, valorHoraExtraNocturna, valorHoraExtraFestiva, recargoDiurnoPct, recargoNocturnoPct, sucursalesId } = req.body;

      const tarifa = await Tarifa.findByPk(Number(id));
      if (!tarifa) {
        res.status(404).json({ success: false, error: 'Tarifa no encontrada' });
        return;
      }

      await tarifa.update({
        nombre,
        valorHoraNormal,
        valorHoraExtraDiurna,
        valorHoraExtraNocturna,
        valorHoraExtraFestiva,
        recargoDiurnoPct,
        recargoNocturnoPct,
        sucursalesId,
      });
      res.status(200).json({ success: true, data: tarifa, message: 'Tarifa actualizada exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  // Eliminar tarifa
  async deleteTarifa(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tarifa = await Tarifa.findByPk(Number(id));
      if (!tarifa) {
        res.status(404).json({ success: false, error: 'Tarifa no encontrada' });
        return;
      }

      await tarifa.destroy();
      res.status(200).json({ success: true, message: 'Tarifa eliminada exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }
}

export default new TarifasController();
