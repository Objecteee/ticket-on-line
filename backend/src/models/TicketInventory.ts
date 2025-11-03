import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TicketInventoryAttributes {
  id: number;
  train_id: number;
  travel_date: string; // DATE
  seat_type: string; // business/first/second
  total_seats: number;
  sold_seats: number;
  locked_seats: number;
  created_at?: Date;
  updated_at?: Date;
}

type TicketInventoryCreation = Optional<TicketInventoryAttributes, 'id' | 'total_seats' | 'sold_seats' | 'locked_seats' | 'created_at' | 'updated_at'>;

class TicketInventory extends Model<TicketInventoryAttributes, TicketInventoryCreation> implements TicketInventoryAttributes {
  public id!: number;
  public train_id!: number;
  public travel_date!: string;
  public seat_type!: string;
  public total_seats!: number;
  public sold_seats!: number;
  public locked_seats!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

TicketInventory.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    train_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    travel_date: { type: DataTypes.DATEONLY, allowNull: false },
    seat_type: { type: DataTypes.STRING(20), allowNull: false },
    total_seats: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    sold_seats: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    locked_seats: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'ticket_inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['train_id', 'travel_date', 'seat_type'] },
      { fields: ['travel_date'] },
    ],
  }
);

export default TicketInventory;


