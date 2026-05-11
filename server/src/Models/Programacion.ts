import { Model, DataTypes, Optional } from 'sequelize';
import Vendedor from './Vendedor';
import Turno from './Turno';
import Sucursales from './Sucursales';
import dbPruebaPowerbi from '@/Database/dbprueba';

interface ProgramacionAttributes {
  id: number;
  vendedorDocumento: string;
  turnoId: number;
  fecha: Date;
  sucursalesId?: string; // CODIGO de Sucursales
  semanaNumero?: number;
  secuencia?: number;
  horasProgramadas?: number;
  aplicaHoraExtra?: boolean;
}

type ProgramacionCreationAttributes = Optional<ProgramacionAttributes, 'id' | 'semanaNumero' | 'secuencia' | 'horasProgramadas' | 'aplicaHoraExtra'>;

class Programacion extends Model<ProgramacionAttributes, ProgramacionCreationAttributes> implements ProgramacionAttributes {
  public id!: number;
  public vendedorDocumento!: string;
  public turnoId!: number;
  public fecha!: Date;
  public sucursalesId?: string;
  public semanaNumero?: number;
  public secuencia?: number;
  public horasProgramadas?: number;
  public aplicaHoraExtra?: boolean;
}

Programacion.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    vendedorDocumento: { type: DataTypes.STRING(20), allowNull: false },
    turnoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    sucursalesId: { type: DataTypes.STRING, allowNull: true },
    semanaNumero: { type: DataTypes.INTEGER.UNSIGNED },
    secuencia: { type: DataTypes.INTEGER.UNSIGNED },
    horasProgramadas: { type: DataTypes.FLOAT },
    aplicaHoraExtra: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize: dbPruebaPowerbi, tableName: 'programaciones', timestamps: true },
);

Programacion.belongsTo(Vendedor, { foreignKey: 'vendedorDocumento', as: 'vendedor' });
Programacion.belongsTo(Turno, { foreignKey: 'turnoId', as: 'turno' });
Programacion.belongsTo(Sucursales, { foreignKey: 'sucursalesId', as: 'sucursal' });

export default Programacion;
