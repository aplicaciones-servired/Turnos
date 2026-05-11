import { Model, DataTypes, Optional } from 'sequelize';
import Sucursales from './Sucursales';
import dbPruebaPowerbi from '@/Database/dbprueba';

interface TarifaAttributes {
  id: number;
  nombre?: string;
  valorHoraNormal: number;
  valorHoraExtraDiurna?: number;
  valorHoraExtraNocturna?: number;
  valorHoraExtraFestiva?: number;
  recargoDiurnoPct?: number;
  recargoNocturnoPct?: number;
  sucursalesId?: string; // CODIGO de Sucursales
}

type TarifaCreationAttributes = Optional<TarifaAttributes, 'id' | 'nombre'>;

class Tarifa extends Model<TarifaAttributes, TarifaCreationAttributes> implements TarifaAttributes {
  public id!: number;
  public nombre?: string;
  public valorHoraNormal!: number;
  public valorHoraExtraDiurna?: number;
  public valorHoraExtraNocturna?: number;
  public valorHoraExtraFestiva?: number;
  public recargoDiurnoPct?: number;
  public recargoNocturnoPct?: number;
  public sucursalesId?: string;
}

Tarifa.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING },
    valorHoraNormal: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    valorHoraExtraDiurna: { type: DataTypes.FLOAT },
    valorHoraExtraNocturna: { type: DataTypes.FLOAT },
    valorHoraExtraFestiva: { type: DataTypes.FLOAT },
    recargoDiurnoPct: { type: DataTypes.FLOAT },
    recargoNocturnoPct: { type: DataTypes.FLOAT },
    sucursalesId: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize: dbPruebaPowerbi, tableName: 'tarifas', timestamps: true },
);

Tarifa.belongsTo(Sucursales, { foreignKey: 'sucursalesId', as: 'sucursal' });

export default Tarifa;
