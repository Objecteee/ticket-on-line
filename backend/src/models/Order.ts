import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type OrderStatus = 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled';

interface OrderAttributes {
  id: number;
  order_number: string;
  user_id: number;
  train_id: number;
  train_number: string;
  travel_date: string; // DATE
  seat_type: string;
  ticket_count: number;
  passenger_name?: string | null;
  passenger_id_card?: string | null;
  ticket_price: string; // DECIMAL(10,2)
  total_amount: string; // DECIMAL(10,2)
  order_status: OrderStatus;
  payment_time?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

type OrderCreationAttributes = Optional<
  OrderAttributes,
  'id' | 'passenger_name' | 'passenger_id_card' | 'payment_time' | 'order_status' | 'created_at' | 'updated_at'
>;

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public order_number!: string;
  public user_id!: number;
  public train_id!: number;
  public train_number!: string;
  public travel_date!: string;
  public seat_type!: string;
  public ticket_count!: number;
  public passenger_name!: string | null;
  public passenger_id_card!: string | null;
  public ticket_price!: string;
  public total_amount!: string;
  public order_status!: OrderStatus;
  public payment_time!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    order_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    train_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    train_number: { type: DataTypes.STRING(20), allowNull: false },
    travel_date: { type: DataTypes.DATEONLY, allowNull: false },
    seat_type: { type: DataTypes.STRING(20), allowNull: false },
    ticket_count: { type: DataTypes.INTEGER, allowNull: false },
    passenger_name: { type: DataTypes.STRING(50), allowNull: true },
    passenger_id_card: { type: DataTypes.STRING(20), allowNull: true },
    ticket_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    order_status: {
      type: DataTypes.ENUM('pending', 'paid', 'completed', 'refunded', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_time: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['order_number'] },
      { fields: ['user_id'] },
      { fields: ['train_id'] },
      { fields: ['order_status'] },
      { fields: ['travel_date'] },
      { fields: ['created_at'] },
    ],
  }
);

export default Order;


