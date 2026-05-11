import { Model, DataTypes, Optional } from 'sequelize';
import db from '../Database/dbPowerbi';

interface SucursalesAttributes {
  ZONA: string;
  CCOSTO: string;
  CODIGO: string;
  NOMBRE: string;
  DIRECCION?: string;
  TIPO?: string;
  DISPOSITIVO?: string;
  SUPERVISOR?: string;
  CANAL?: string;
  CATEGORIA?: string;
  HORA_ENTRADA?: string; // HH:mm:ss
  HORA_SALIDA?: string; // HH:mm:ss
  HORA_ENTRADA_FES?: string; // HH:mm:ss
  HORA_SALIDA_FES?: string; // HH:mm:ss
  SUBZONA?: string;
  CELULA?: string;
  HORAS_ORDINARIAS?: number;
  HORAS_FESTIVAS?: number;
  ESTADO?: string;
}
export interface SucursalesCreationAttributes extends SucursalesAttributes {}

class Sucursales extends Model<SucursalesAttributes, SucursalesCreationAttributes> implements SucursalesAttributes {
  public id!: number;
  public ZONA!: string;
  public CCOSTO!: string;
  public CODIGO!: string;
  public NOMBRE!: string;
  public DIRECCION?: string;
  public TIPO?: string;
  public DISPOSITIVO?: string;
  public SUPERVISOR?: string
  public CANAL?: string;
  public CATEGORIA?: string;
  public HORA_ENTRADA?: string;
  public HORA_SALIDA?: string;
  public HORA_ENTRADA_FES?: string;
  public HORA_SALIDA_FES?: string;
  public SUBZONA?: string;
  public CELULA?: string;
  public HORAS_ORDINARIAS?: number;
  public HORAS_FESTIVAS?: number;
  public ESTADO?: string;
}

Sucursales.init(
  {
    ZONA: { type: DataTypes.STRING, allowNull: false },
    CCOSTO: { type: DataTypes.STRING, allowNull: false },
    CODIGO: { type: DataTypes.STRING, allowNull: false },
    NOMBRE: { type: DataTypes.STRING },
    DIRECCION: { type: DataTypes.STRING },
    TIPO: { type: DataTypes.STRING },
    DISPOSITIVO: { type: DataTypes.STRING },
    SUPERVISOR: { type: DataTypes.STRING },
    CANAL: { type: DataTypes.STRING },
    CATEGORIA: { type: DataTypes.STRING },
    HORA_ENTRADA: { type: DataTypes.TIME },
    HORA_SALIDA: { type: DataTypes.TIME },
    HORA_ENTRADA_FES: { type: DataTypes.TIME },
    HORA_SALIDA_FES: { type: DataTypes.TIME },
    SUBZONA: { type: DataTypes.STRING },
    CELULA: { type: DataTypes.STRING },
    HORAS_ORDINARIAS: { type: DataTypes.INTEGER },
    HORAS_FESTIVAS: { type: DataTypes.INTEGER },
    ESTADO: { type: DataTypes.STRING },
  },
  { sequelize: db, tableName: 'SUCURSALES', timestamps: true },
);

export default Sucursales;
