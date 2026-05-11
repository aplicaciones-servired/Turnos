import { Request, Response } from 'express'
import Sucursales from '@/Models/Sucursales';


export const SucursalesController = async (req: Request, res: Response) => {
  const centro = req.query.centro as string | undefined
  try {
    const sucursales = await Sucursales.findAll({
      where: centro ? { CCOSTO: centro } : undefined,
    })
    res.status(200).json({
      datos: sucursales,
      mensaje: 'Sucursales obtenidas exitosamente',
    })
  } catch (error) {
    console.error('Error al obtener sucursales:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    res.status(500).json({ error: 'Error al obtener las sucursales', detalles: errorMessage })
  }
}