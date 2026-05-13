import { Request, Response } from 'express';
import CalculoHoras from '@/Models/CalculoHoras';
import {
  generarCalculoNomina,
  obtenerCalculosPeriodo,
  calcularHorasVendedor,
} from '@/Services/calculoHoras.service';

class CalculoHorasController {
  // Generar cálculo de nómina para un vendedor en un período
  async generarCalculo(req: Request, res: Response): Promise<void> {
    try {
      const { vendedorDocumento, mes, anio, tarifaId } = req.body;

      if (!vendedorDocumento || !mes || !anio) {
        res.status(400).json({
          success: false,
          error: 'Campos requeridos: vendedorDocumento, mes, anio',
        });
        return;
      }

      if (mes < 1 || mes > 12) {
        res.status(400).json({
          success: false,
          error: 'Mes debe estar entre 1 y 12',
        });
        return;
      }

      const calculo = await generarCalculoNomina(
        vendedorDocumento,
        mes,
        anio,
        tarifaId ? Number(tarifaId) : undefined
      );

      res.status(200).json({
        success: true,
        data: calculo,
        message: 'Cálculo generado exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  // Obtener cálculos de un período
  async obtenerCalculosPeriodo(req: Request, res: Response): Promise<void> {
    try {
      const { mes, anio } = req.params;

      if (!mes || !anio) {
        res.status(400).json({
          success: false,
          error: 'Parámetros requeridos: mes, anio',
        });
        return;
      }

      if (Number(mes) < 1 || Number(mes) > 12) {
        res.status(400).json({
          success: false,
          error: 'Mes debe estar entre 1 y 12',
        });
        return;
      }

      const calculos = await obtenerCalculosPeriodo(Number(mes), Number(anio));

      res.status(200).json({
        success: true,
        data: calculos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  // Obtener cálculo específico de un vendedor
  async obtenerCalculoVendedor(req: Request, res: Response): Promise<void> {
    try {
      const { vendedorDocumento, mes, anio } = req.params;

      const calculo = await CalculoHoras.findOne({
        where: {
          vendedorDocumento,
          mes: Number(mes),
          anio: Number(anio),
        },
      });

      if (!calculo) {
        res.status(404).json({
          success: false,
          error: 'Cálculo no encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: calculo,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  // Obtener preview de cálculo sin guardar
  async previewCalculo(req: Request, res: Response): Promise<void> {
    try {
      const { vendedorDocumento, mes, anio, tarifaId } = req.query;

      if (!vendedorDocumento || !mes || !anio) {
        res.status(400).json({
          success: false,
          error: 'Parámetros requeridos: vendedorDocumento, mes, anio',
        });
        return;
      }

      const horasCalculadas = await calcularHorasVendedor(
        String(vendedorDocumento),
        Number(mes),
        Number(anio),
        tarifaId ? Number(tarifaId) : undefined
      );

      res.status(200).json({
        success: true,
        data: horasCalculadas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  // Cambiar estado de cálculo
  async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['borrador', 'procesado', 'pagado'].includes(estado)) {
        res.status(400).json({
          success: false,
          error: 'Estado inválido. Debe ser: borrador, procesado, pagado',
        });
        return;
      }

      const calculo = await CalculoHoras.findByPk(Number(id));

      if (!calculo) {
        res.status(404).json({
          success: false,
          error: 'Cálculo no encontrado',
        });
        return;
      }

      await calculo.update({ estado });

      res.status(200).json({
        success: true,
        data: calculo,
        message: 'Estado actualizado exitosamente',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}

export default new CalculoHorasController();
