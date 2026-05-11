import { DataTypes, Model } from 'sequelize';
import dbPowerbi from '@/Database/dbPowerbi';

export interface VendedorAttributes {
  DOCUMENTO: string;
  NOMBRES?: string;
  GRPVTAS_CODIGO?: string;
  CARGO?: string;
  VERSION?: string;
  NOMBRECARGO?: string;
  CCOSTO?: string;
}

export interface VendedorCreationAttributes extends VendedorAttributes {}

class Vendedor extends Model<VendedorAttributes, VendedorCreationAttributes> implements VendedorAttributes {
  public DOCUMENTO!: string;
  public NOMBRES?: string;
  public GRPVTAS_CODIGO?: string;
  public CARGO?: string;
  public VERSION?: string;
  public NOMBRECARGO?: string;
  public CCOSTO?: string;
}

Vendedor.init(
  {
    DOCUMENTO: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false
    },
    NOMBRES: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    GRPVTAS_CODIGO: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    CARGO: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    VERSION: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    NOMBRECARGO: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    CCOSTO: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
  },
  {
    sequelize: dbPowerbi,
    tableName: 'VENDEDORES',
    timestamps: false,
  },
);

export default Vendedor;
