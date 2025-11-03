import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PasswordResetAttributes {
  id: number;
  user_id: number;
  identifier: string; // email or phone or username
  code: string; // 6-digit
  expires_at: Date;
  used: number; // 0/1
  created_at?: Date;
  updated_at?: Date;
}

type Creation = Optional<PasswordResetAttributes, 'id' | 'created_at' | 'updated_at' | 'used'>;

class PasswordReset extends Model<PasswordResetAttributes, Creation> implements PasswordResetAttributes {
  public id!: number;
  public user_id!: number;
  public identifier!: string;
  public code!: string;
  public expires_at!: Date;
  public used!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

PasswordReset.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    identifier: { type: DataTypes.STRING(100), allowNull: false },
    code: { type: DataTypes.STRING(10), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'password_resets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['identifier'] },
      { fields: ['code'] },
    ],
  }
);

export default PasswordReset;


