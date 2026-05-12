import { Model, DataTypes } from 'sequelize';
import dbPruebaPowerbi from '@/Database/dbprueba';

class Counter extends Model {
  public name!: string;
  public value!: number;
}

Counter.init(
  {
    name: { type: DataTypes.STRING(64), primaryKey: true },
    value: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 },
  },
  { sequelize: dbPruebaPowerbi, tableName: 'counters', timestamps: false },
);

export default Counter;
