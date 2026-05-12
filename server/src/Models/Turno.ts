import { Model, DataTypes, Optional } from 'sequelize';
import Punto from './Sucursales';
import dbPruebaPowerbi from '@/Database/dbprueba';

interface TurnoAttributes {
  id: number;
  nombre: string;
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  esNocturno?: boolean;
}

type TurnoCreationAttributes = Optional<TurnoAttributes, 'id' | 'esNocturno'>;

class Turno extends Model<TurnoAttributes, TurnoCreationAttributes> implements TurnoAttributes {
  public id!: number;
  public nombre!: string;
  public horaInicio!: string;
  public horaFin!: string;
  public esNocturno?: boolean;
}

Turno.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    horaInicio: { type: DataTypes.STRING, allowNull: false },
    horaFin: { type: DataTypes.STRING, allowNull: false },
    esNocturno: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize: dbPruebaPowerbi, tableName: 'turnos', timestamps: true },
);

export default Turno;
