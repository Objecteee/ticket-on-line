import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PassengerAttributes {
  id: number;
  user_id: number;
  name: string;
  id_card: string;
  phone?: string | null;
  is_default: number; // 1 default, 0 normal
  created_at?: Date;
  updated_at?: Date;
}

type PassengerCreation = Optional<PassengerAttributes, 'id' | 'phone' | 'is_default' | 'created_at' | 'updated_at'>;

class Passenger extends Model<PassengerAttributes, PassengerCreation> implements PassengerAttributes {
  public id!: number;
  public user_id!: number;
  public name!: string;
  public id_card!: string;
  public phone!: string | null;
  public is_default!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Passenger.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    name: { type: DataTypes.STRING(50), allowNull: false },
    id_card: { type: DataTypes.STRING(30), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    is_default: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'passengers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { unique: true, fields: ['user_id', 'id_card'] },
      { fields: ['is_default'] },
    ],
  }
);

export default Passenger;


