import { Model, DataTypes, Optional } from 'sequelize';
import Punto from './Sucursales';
import dbPruebaPowerbi from '@/Database/dbprueba';

interface TurnoAttributes {
  id: number;
  nombre: string;
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  esNocturno?: boolean;
  puntoId?: number;
}

type TurnoCreationAttributes = Optional<TurnoAttributes, 'id' | 'esNocturno'>;

class Turno extends Model<TurnoAttributes, TurnoCreationAttributes> implements TurnoAttributes {
  public id!: number;
  public nombre!: string;
  public horaInicio!: string;
  public horaFin!: string;
  public esNocturno?: boolean;
  public puntoId?: number;
}

Turno.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    horaInicio: { type: DataTypes.STRING, allowNull: false },
    horaFin: { type: DataTypes.STRING, allowNull: false },
    esNocturno: { type: DataTypes.BOOLEAN, defaultValue: false },
    puntoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  },
  { sequelize: dbPruebaPowerbi, tableName: 'turnos', timestamps: true },
);

Turno.belongsTo(Punto, { foreignKey: 'puntoId', as: 'punto' });

export default Turno;
