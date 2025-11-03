import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type MessageStatus = 'pending' | 'approved' | 'rejected';

interface MessageAttributes {
  id: number;
  user_id: number;
  username: string;
  content: string;
  status: MessageStatus;
  reply?: string | null;
  reply_time?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

type MessageCreation = Optional<MessageAttributes, 'id' | 'status' | 'reply' | 'reply_time' | 'created_at' | 'updated_at'>;

class Message extends Model<MessageAttributes, MessageCreation> implements MessageAttributes {
  public id!: number;
  public user_id!: number;
  public username!: string;
  public content!: string;
  public status!: MessageStatus;
  public reply!: string | null;
  public reply_time!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Message.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    username: { type: DataTypes.STRING(50), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    reply: { type: DataTypes.TEXT, allowNull: true },
    reply_time: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
    ],
  }
);

export default Message;

