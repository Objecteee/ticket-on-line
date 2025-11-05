/**
 * 初始化库存数据脚本
 * 为所有车次和未来日期生成完整的库存数据
 */

import { sequelize } from '../config/database';
import Train from '../models/Train';
import TicketInventory from '../models/TicketInventory';

// 初始化未来多少天的库存
const FUTURE_DAYS = 30;

// 座位类型
const seatTypes: Array<'business' | 'first' | 'second'> = ['business', 'first', 'second'];

// 生成日期（未来N天）
function getDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

async function seedInventory() {
  try {
    console.log('🚀 开始初始化库存数据...');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 获取所有运营中的车次
    const trains = await Train.findAll({ where: { status: 1 } });
    if (trains.length === 0) {
      throw new Error('没有可用的车次，请先运行 npm run seed:trains 生成车次数据');
    }
    console.log(`✅ 找到 ${trains.length} 个可用车次`);

    let createdCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    // 为每个车次生成未来N天的库存
    for (const train of trains) {
      console.log(`\n📦 处理车次: ${train.train_number}`);
      
      // 为未来30天生成库存
      for (let day = 1; day <= FUTURE_DAYS; day++) {
        const travelDate = getDate(day);
        
        // 为每种座位类型生成库存
        for (const seatType of seatTypes) {
          // 获取该座位类型的总座位数
          let totalSeats = 0;
          if (seatType === 'business') totalSeats = train.total_seats_business;
          else if (seatType === 'first') totalSeats = train.total_seats_first;
          else if (seatType === 'second') totalSeats = train.total_seats_second;
          
          // 如果该座位类型不可售，跳过
          if (totalSeats <= 0) continue;
          
          // 检查库存是否已存在
          const existing = await TicketInventory.findOne({
            where: {
              train_id: train.id,
              travel_date: travelDate,
              seat_type: seatType,
            },
          });

          if (existing) {
            // 如果已存在，检查是否需要更新total_seats（车次配置可能已更改）
            if (existing.total_seats !== totalSeats) {
              await existing.update({ total_seats: totalSeats });
              updatedCount++;
            } else {
              skippedCount++;
            }
            continue;
          }

          // 创建库存记录
          await TicketInventory.create({
            train_id: train.id,
            travel_date: travelDate,
            seat_type: seatType,
            total_seats: totalSeats,
            sold_seats: 0,
            locked_seats: 0,
          });

          createdCount++;
        }
      }
      
      // 显示该车次的进度
      const seatTypesCount = [train.total_seats_business, train.total_seats_first, train.total_seats_second]
        .filter(count => count > 0).length;
      console.log(`  ✅ ${train.train_number}: 已处理 ${FUTURE_DAYS} 天的库存（${seatTypesCount}种座位类型）`);
    }

    console.log(`\n🎉 完成！`);
    console.log(`📊 统计:`);
    console.log(`   - 新建库存记录: ${createdCount} 条`);
    console.log(`   - 更新库存记录: ${updatedCount} 条`);
    console.log(`   - 跳过已存在: ${skippedCount} 条`);
    console.log(`   - 覆盖车次: ${trains.length} 个`);
    console.log(`   - 覆盖日期: 未来 ${FUTURE_DAYS} 天`);
    
    // 显示库存统计
    const totalInventory = await TicketInventory.count();
    const totalTrains = await Train.count({ where: { status: 1 } });
    console.log(`\n📈 库存数据统计:`);
    console.log(`   - 总库存记录数: ${totalInventory}`);
    console.log(`   - 运营车次数: ${totalTrains}`);
    
    // 按座位类型统计
    const businessCount = await TicketInventory.count({ 
      where: { seat_type: 'business' } 
    });
    const firstCount = await TicketInventory.count({ 
      where: { seat_type: 'first' } 
    });
    const secondCount = await TicketInventory.count({ 
      where: { seat_type: 'second' } 
    });
    console.log(`   - 商务座库存记录: ${businessCount}`);
    console.log(`   - 一等座库存记录: ${firstCount}`);
    console.log(`   - 二等座库存记录: ${secondCount}`);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
if (require.main === module) {
  seedInventory()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export default seedInventory;

