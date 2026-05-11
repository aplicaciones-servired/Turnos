import { Request, Response } from 'express'
import Vendedor from '@/Models/Vendedor'

export const VendedoresController = async (req: Request, res: Response) => {
  const centro = req.query.centro as string | undefined
  try {
    const vendedores = await Vendedor.findAll({
      where: centro ? { CCOSTO: centro } : undefined,
    })
    res.status(200).json({
      datos: vendedores,
      mensaje: 'Vendedores obtenidos exitosamente',
    })
  } catch (error) {
    console.error('Error al obtener vendedores:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    res.status(500).json({ error: 'Error al obtener los vendedores', detalles: errorMessage })
  }
}