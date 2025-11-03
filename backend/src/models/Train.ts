/**
 * 车次模型
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TrainAttributes {
  id: number;
  train_number: string; // 车次号，唯一
  departure_station: string; // 始发站
  arrival_station: string; // 终点站
  intermediate_stations?: string | null; // 途经站点（JSON字符串）
  departure_time: string; // TIME
  arrival_time: string; // TIME
  vehicle_type?: string | null; // 车型
  total_seats_business: number;
  total_seats_first: number;
  total_seats_second: number;
  price_business: string; // DECIMAL(10,2) as string to avoid JS float
  price_first: string;
  price_second: string;
  status: number; // 1:运营 0:停运
  created_at?: Date;
  updated_at?: Date;
}

type TrainCreationAttributes = Optional<
  TrainAttributes,
  | 'id'
  | 'intermediate_stations'
  | 'vehicle_type'
  | 'total_seats_business'
  | 'total_seats_first'
  | 'total_seats_second'
  | 'price_business'
  | 'price_first'
  | 'price_second'
  | 'status'
  | 'created_at'
  | 'updated_at'
>;

class Train extends Model<TrainAttributes, TrainCreationAttributes> implements TrainAttributes {
  public id!: number;
  public train_number!: string;
  public departure_station!: string;
  public arrival_station!: string;
  public intermediate_stations!: string | null;
  public departure_time!: string;
  public arrival_time!: string;
  public vehicle_type!: string | null;
  public total_seats_business!: number;
  public total_seats_first!: number;
  public total_seats_second!: number;
  public price_business!: string;
  public price_first!: string;
  public price_second!: string;
  public status!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Train.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    train_number: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    departure_station: { type: DataTypes.STRING(50), allowNull: false },
    arrival_station: { type: DataTypes.STRING(50), allowNull: false },
    intermediate_stations: { type: DataTypes.TEXT, allowNull: true, comment: 'JSON字符串' },
    departure_time: { type: DataTypes.TIME, allowNull: false },
    arrival_time: { type: DataTypes.TIME, allowNull: false },
    vehicle_type: { type: DataTypes.STRING(20), allowNull: true },
    total_seats_business: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    total_seats_first: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    total_seats_second: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    price_business: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: '0.00' },
    price_first: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: '0.00' },
    price_second: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: '0.00' },
    status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'trains',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['train_number'] },
      { fields: ['status'] },
      { fields: ['departure_station'] },
      { fields: ['arrival_station'] },
    ],
  }
);

export default Train;


