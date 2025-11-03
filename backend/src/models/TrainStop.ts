import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TrainStopAttributes {
  id: number;
  train_id: number;
  station_name: string;
  stop_order: number;
  arrival_time: string; // TIME
  departure_time: string; // TIME
  created_at?: Date;
  updated_at?: Date;
}

type TrainStopCreation = Optional<TrainStopAttributes, 'id' | 'created_at' | 'updated_at'>;

class TrainStop extends Model<TrainStopAttributes, TrainStopCreation> implements TrainStopAttributes {
  public id!: number;
  public train_id!: number;
  public station_name!: string;
  public stop_order!: number;
  public arrival_time!: string;
  public departure_time!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

TrainStop.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    train_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    station_name: { type: DataTypes.STRING(50), allowNull: false },
    stop_order: { type: DataTypes.INTEGER, allowNull: false },
    arrival_time: { type: DataTypes.TIME, allowNull: false },
    departure_time: { type: DataTypes.TIME, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'train_stops',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['train_id', 'stop_order'] },
      { fields: ['station_name'] },
      { unique: false, fields: ['train_id', 'station_name'] },
    ],
  }
);

export default TrainStop;


