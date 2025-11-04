/**
 * 为用户生成乘车人假数据脚本
 * 为用户ID=3生成常用乘车人信息
 */

import { sequelize } from '../config/database';
import Passenger from '../models/Passenger';
import User from '../models/User';

const USER_ID = 3; // lqy用户ID

// 乘车人数据（真实姓名和身份证号格式）
const passengerData = [
  {
    name: '李强',
    id_card: '110101199001011234',
    phone: '13800138001',
    is_default: 1, // 默认乘车人
  },
  {
    name: '王芳',
    id_card: '110101199002021234',
    phone: '13800138002',
    is_default: 0,
  },
  {
    name: '张伟',
    id_card: '110101199003031234',
    phone: '13800138003',
    is_default: 0,
  },
  {
    name: '刘敏',
    id_card: '110101199004041234',
    phone: '13800138004',
    is_default: 0,
  },
  {
    name: '陈静',
    id_card: '110101199005051234',
    phone: '13800138005',
    is_default: 0,
  },
];

async function seedPassengers() {
  try {
    console.log('🚀 开始生成乘车人数据...');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 检查用户是否存在
    const user = await User.findByPk(USER_ID);
    if (!user) {
      throw new Error(`用户ID ${USER_ID} 不存在`);
    }
    console.log(`✅ 找到用户: ${user.username} (ID: ${USER_ID})`);

    // 检查是否已有乘车人数据
    const existingPassengers = await Passenger.findAll({ where: { user_id: USER_ID } });
    if (existingPassengers.length > 0) {
      console.log(`⚠️  用户已有 ${existingPassengers.length} 个乘车人，将跳过已有数据`);
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const passengerInfo of passengerData) {
      // 检查身份证是否已存在（同一用户下身份证号唯一）
      const existing = await Passenger.findOne({
        where: {
          user_id: USER_ID,
          id_card: passengerInfo.id_card,
        },
      });

      if (existing) {
        console.log(`⏭️  乘车人 ${passengerInfo.name} (${passengerInfo.id_card}) 已存在，跳过`);
        skippedCount++;
        continue;
      }

      // 如果是默认乘车人，先清除其他默认状态
      if (passengerInfo.is_default === 1) {
        await Passenger.update(
          { is_default: 0 },
          { where: { user_id: USER_ID, is_default: 1 } }
        );
      }

      // 创建乘车人
      await Passenger.create({
        user_id: USER_ID,
        name: passengerInfo.name,
        id_card: passengerInfo.id_card,
        phone: passengerInfo.phone,
        is_default: passengerInfo.is_default,
      });

      createdCount++;
      const defaultText = passengerInfo.is_default === 1 ? '（默认）' : '';
      console.log(`✅ 已创建乘车人: ${passengerInfo.name} ${defaultText}`);
    }

    console.log(`\n🎉 完成！共创建 ${createdCount} 个乘车人，跳过 ${skippedCount} 个已存在的`);
    
    // 显示最终乘车人列表
    const allPassengers = await Passenger.findAll({
      where: { user_id: USER_ID },
      order: [['is_default', 'DESC'], ['created_at', 'ASC']],
    });
    
    console.log(`\n📋 用户 ${user.username} 的乘车人列表:`);
    allPassengers.forEach((p, index) => {
      const defaultText = p.is_default === 1 ? ' [默认]' : '';
      console.log(`   ${index + 1}. ${p.name} - ${p.id_card}${defaultText}`);
    });
  } catch (error) {
    console.error('❌ 生成数据失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
if (require.main === module) {
  seedPassengers()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export default seedPassengers;

