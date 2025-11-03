import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface RefundAttributes {
  id: number;
  order_id: number;
  train_id: number;
  departure_time: Date;
  train_number: string;
  seat_type: string;
  destination: string;
  route?: string | null;
  vehicle_type?: string | null;
  ticket_price: string;
  ticket_count: number;
  service_fee_rate: string; // DECIMAL(5,2)
  service_fee: string; // DECIMAL(10,2)
  refund_amount: string; // DECIMAL(10,2)
  refund_reason?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

type RefundCreationAttributes = Optional<RefundAttributes, 'id' | 'route' | 'vehicle_type' | 'refund_reason' | 'created_at' | 'updated_at'>;

class Refund extends Model<RefundAttributes, RefundCreationAttributes> implements RefundAttributes {
  public id!: number;
  public order_id!: number;
  public train_id!: number;
  public departure_time!: Date;
  public train_number!: string;
  public seat_type!: string;
  public destination!: string;
  public route!: string | null;
  public vehicle_type!: string | null;
  public ticket_price!: string;
  public ticket_count!: number;
  public service_fee_rate!: string;
  public service_fee!: string;
  public refund_amount!: string;
  public refund_reason!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Refund.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    train_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    departure_time: { type: DataTypes.DATE, allowNull: false },
    train_number: { type: DataTypes.STRING(20), allowNull: false },
    seat_type: { type: DataTypes.STRING(20), allowNull: false },
    destination: { type: DataTypes.STRING(50), allowNull: false },
    route: { type: DataTypes.STRING(100), allowNull: true },
    vehicle_type: { type: DataTypes.STRING(20), allowNull: true },
    ticket_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    ticket_count: { type: DataTypes.INTEGER, allowNull: false },
    service_fee_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: '0.00' },
    service_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    refund_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    refund_reason: { type: DataTypes.STRING(255), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'refunds',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['order_id'] },
      { fields: ['train_id'] },
      { fields: ['departure_time'] },
      { fields: ['created_at'] },
    ],
  }
);

export default Refund;


