import { Model, DataTypes, Optional } from 'sequelize';
import dbPruebaPowerbi from '@/Database/dbprueba';

interface CalculoHorasAttributes {
  id: number;
  vendedorDocumento: string;
  mes: number; // 1-12
  anio: number;
  horasTrabajadasNormales: number; // Horas base
  horasExtraDiurna: number;
  horasExtraNocturna: number;
  horasExtraFestiva: number;
  horasPermiso: number; // De novedades
  horasIncapacidad: number;
  horasAusencia: number;
  valorHorasNormales: number;
  valorHorasExtraDiurna: number;
  valorHorasExtraNocturna: number;
  valorHorasExtraFestiva: number;
  recargosDiurnos: number; // valor del recargo %
  recargosNocturnos: number;
  totalCalculado: number;
  estado?: 'borrador' | 'procesado' | 'pagado';
  fechaGeneracion: Date;
}

type CalculoHorasCreationAttributes = Optional<
  CalculoHorasAttributes,
  'id' | 'estado' | 'fechaGeneracion'
>;

class CalculoHoras
  extends Model<CalculoHorasAttributes, CalculoHorasCreationAttributes>
  implements CalculoHorasAttributes
{
  public id!: number;
  public vendedorDocumento!: string;
  public mes!: number;
  public anio!: number;
  public horasTrabajadasNormales!: number;
  public horasExtraDiurna!: number;
  public horasExtraNocturna!: number;
  public horasExtraFestiva!: number;
  public horasPermiso!: number;
  public horasIncapacidad!: number;
  public horasAusencia!: number;
  public valorHorasNormales!: number;
  public valorHorasExtraDiurna!: number;
  public valorHorasExtraNocturna!: number;
  public valorHorasExtraFestiva!: number;
  public recargosDiurnos!: number;
  public recargosNocturnos!: number;
  public totalCalculado!: number;
  public estado?: 'borrador' | 'procesado' | 'pagado';
  public fechaGeneracion!: Date;
}

CalculoHoras.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    vendedorDocumento: { type: DataTypes.STRING(20), allowNull: false },
    mes: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    anio: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    horasTrabajadasNormales: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    horasExtraDiurna: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    horasExtraNocturna: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    horasExtraFestiva: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    horasPermiso: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    horasIncapacidad: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    horasAusencia: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    valorHorasNormales: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    valorHorasExtraDiurna: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    valorHorasExtraNocturna: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    valorHorasExtraFestiva: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    recargosDiurnos: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    recargosNocturnos: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    totalCalculado: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    estado: {
      type: DataTypes.ENUM('borrador', 'procesado', 'pagado'),
      defaultValue: 'borrador',
    },
    fechaGeneracion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { sequelize: dbPruebaPowerbi, tableName: 'calculo_horas', timestamps: true }
);

export default CalculoHoras;
