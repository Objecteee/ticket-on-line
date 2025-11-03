import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TicketSaleAttributes {
  id: number;
  sale_date: string; // DATE
  train_id: number;
  train_number: string;
  destination: string;
  seat_type: string;
  ticket_count: number;
  actual_amount: string; // DECIMAL(10,2)
  order_id?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

type TicketSaleCreationAttributes = Optional<TicketSaleAttributes, 'id' | 'order_id' | 'created_at' | 'updated_at'>;

class TicketSale extends Model<TicketSaleAttributes, TicketSaleCreationAttributes> implements TicketSaleAttributes {
  public id!: number;
  public sale_date!: string;
  public train_id!: number;
  public train_number!: string;
  public destination!: string;
  public seat_type!: string;
  public ticket_count!: number;
  public actual_amount!: string;
  public order_id!: number | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

TicketSale.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    sale_date: { type: DataTypes.DATEONLY, allowNull: false },
    train_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    train_number: { type: DataTypes.STRING(20), allowNull: false },
    destination: { type: DataTypes.STRING(50), allowNull: false },
    seat_type: { type: DataTypes.STRING(20), allowNull: false },
    ticket_count: { type: DataTypes.INTEGER, allowNull: false },
    actual_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    order_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'ticket_sales',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['sale_date'] },
      { fields: ['train_id'] },
      { fields: ['destination'] },
      { fields: ['order_id'] },
    ],
  }
);

export default TicketSale;


