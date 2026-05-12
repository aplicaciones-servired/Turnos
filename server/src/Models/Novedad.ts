import { Model, DataTypes, Optional } from 'sequelize';
import Vendedor from './Vendedor';
import dbPruebaPowerbi from '@/Database/dbprueba';

interface NovedadAttributes {
  id: number;
  ticketNumber?: number;
  vendedorDocumento: string;
  fecha: Date;
  tipo: 'permiso' | 'incapacidad' | 'ausencia' | 'otro';
  horas: number;
  incidenteNumero?: string;
  descripcion?: string;
}

type NovedadCreationAttributes = Optional<NovedadAttributes, 'id' | 'incidenteNumero' | 'descripcion'>;

class Novedad extends Model<NovedadAttributes, NovedadCreationAttributes> implements NovedadAttributes {
  public id!: number;
  public ticketNumber?: number;
  public vendedorDocumento!: string;
  public fecha!: Date;
  public tipo!: 'permiso' | 'incapacidad' | 'ausencia' | 'otro';
  public horas!: number;
  public incidenteNumero?: string;
  public descripcion?: string;
}

Novedad.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      ticketNumber: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, unique: true },
    vendedorDocumento: { type: DataTypes.STRING(20), allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    tipo: { type: DataTypes.ENUM('permiso', 'incapacidad', 'ausencia', 'otro'), allowNull: false },
    horas: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    incidenteNumero: { type: DataTypes.STRING },
    descripcion: { type: DataTypes.TEXT },
  },
  { sequelize: dbPruebaPowerbi, tableName: 'novedades', timestamps: true },
);

Novedad.belongsTo(Vendedor, { foreignKey: 'vendedorDocumento', as: 'vendedor' });

export default Novedad;
