/**
 * 为用户生成订单假数据脚本
 * 生成各种状态的订单，包括售票、退票等关联数据
 */

import { sequelize } from '../config/database';
import Train from '../models/Train';
import Order, { OrderStatus } from '../models/Order';
import TicketSale from '../models/TicketSale';
import Refund from '../models/Refund';
import TicketInventory from '../models/TicketInventory';
import { Op } from 'sequelize';

const USER_ID = 3; // lqy用户ID

// 假乘客姓名和身份证号
const passengers = [
  { name: '李强', id_card: '110101199001011234' },
  { name: '王芳', id_card: '110101199002021234' },
  { name: '张伟', id_card: '110101199003031234' },
  { name: '刘敏', id_card: '110101199004041234' },
  { name: '陈静', id_card: '110101199005051234' },
];

// 订单状态配置（至少20条，各种状态都要有）
const orderStatusDistribution: Array<{ status: OrderStatus; count: number; description: string }> = [
  { status: 'pending', count: 6, description: '待支付订单' },
  { status: 'paid', count: 7, description: '已支付订单' },
  { status: 'completed', count: 5, description: '已完成订单' },
  { status: 'cancelled', count: 4, description: '已取消订单' },
  { status: 'refunded', count: 4, description: '已退款订单' },
];

// 座位类型
const seatTypes: Array<'business' | 'first' | 'second'> = ['business', 'first', 'second'];

// 生成订单号
const genOrderNo = (index: number) => {
  const timestamp = Date.now() + index;
  return 'OD' + timestamp.toString(36).toUpperCase();
};

// 生成日期（过去30天到未来30天）
function getTravelDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

// 生成创建时间（相对于出行日期）
function getCreatedAt(travelDate: string, offsetHours: number): Date {
  const date = new Date(travelDate);
  date.setHours(date.getHours() + offsetHours);
  return date;
}

// 生成支付时间（订单创建后1-24小时内）
function getPaymentTime(createdAt: Date): Date {
  const paymentTime = new Date(createdAt);
  const hours = 1 + Math.floor(Math.random() * 24);
  paymentTime.setHours(paymentTime.getHours() + hours);
  return paymentTime;
}

async function seedOrders() {
  try {
    console.log('🚀 开始生成订单数据...');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 获取所有可用的车次
    const trains = await Train.findAll({ where: { status: 1 } });
    if (trains.length === 0) {
      throw new Error('没有可用的车次，请先运行 npm run seed:trains 生成车次数据');
    }
    console.log(`✅ 找到 ${trains.length} 个可用车次`);

    // 获取停靠站信息（用于确定目的地）
    const TrainStop = (await import('../models/TrainStop')).default;
    
    let orderIndex = 0;
    let totalCreated = 0;

    // 按状态生成订单
    for (const statusConfig of orderStatusDistribution) {
      console.log(`\n📝 生成 ${statusConfig.description} (${statusConfig.count}条)...`);
      
      for (let i = 0; i < statusConfig.count; i++) {
        // 随机选择车次
        const train = trains[Math.floor(Math.random() * trains.length)];
        
        // 获取车次停靠站来确定目的地
        const stops = await TrainStop.findAll({
          where: { train_id: train.id },
          order: [['stop_order', 'ASC']],
        });
        const destination = stops.length > 0 ? stops[stops.length - 1].station_name : train.arrival_station;
        
        // 随机选择座位类型（确保该座位类型有座位）
        let seatType: 'business' | 'first' | 'second' = 'second';
        const availableSeatTypes = [];
        if (train.total_seats_business > 0) availableSeatTypes.push('business');
        if (train.total_seats_first > 0) availableSeatTypes.push('first');
        if (train.total_seats_second > 0) availableSeatTypes.push('second');
        
        if (availableSeatTypes.length > 0) {
          seatType = availableSeatTypes[Math.floor(Math.random() * availableSeatTypes.length)] as 'business' | 'first' | 'second';
        }
        
        // 获取票价
        let price = 0;
        if (seatType === 'business') price = Number(train.price_business);
        else if (seatType === 'first') price = Number(train.price_first);
        else if (seatType === 'second') price = Number(train.price_second);
        
        if (price <= 0) {
          console.log(`⚠️  车次 ${train.train_number} 的 ${seatType} 座位不可售，跳过`);
          continue;
        }
        
        // 随机票数（1-3张）
        const ticketCount = 1 + Math.floor(Math.random() * 3);
        
        // 随机选择乘客
        const passenger = passengers[Math.floor(Math.random() * passengers.length)];
        
        // 生成出行日期（过去30天到未来30天）
        const daysOffset = -30 + Math.floor(Math.random() * 61); // -30 到 30
        const travelDate = getTravelDate(daysOffset);
        
        // 生成订单创建时间（出行日期前1-30天）
        const createdDaysBefore = 1 + Math.floor(Math.random() * 30);
        const createdAt = getCreatedAt(travelDate, -createdDaysBefore * 24);
        
        // 创建订单
        const order = await Order.create({
          order_number: genOrderNo(orderIndex++),
          user_id: USER_ID,
          train_id: train.id,
          train_number: train.train_number,
          travel_date: travelDate,
          seat_type: seatType,
          ticket_count: ticketCount,
          passenger_name: passenger.name,
          passenger_id_card: passenger.id_card,
          ticket_price: price.toFixed(2),
          total_amount: (price * ticketCount).toFixed(2),
          order_status: statusConfig.status,
          payment_time: null,
          created_at: createdAt,
          updated_at: createdAt,
        });

        // 根据订单状态处理相关数据
        if (statusConfig.status === 'pending') {
          // 待支付订单：不需要处理
          console.log(`  ✅ 订单 ${order.order_number}: ${train.train_number} ${travelDate} ${seatType} ${ticketCount}张 - 待支付`);
        } else if (statusConfig.status === 'cancelled') {
          // 已取消订单：不需要处理库存和售票
          console.log(`  ✅ 订单 ${order.order_number}: ${train.train_number} ${travelDate} ${seatType} ${ticketCount}张 - 已取消`);
        } else {
          // 已支付、已完成、已退款订单：需要支付时间、售票记录、库存
          const paymentTime = getPaymentTime(createdAt);
          await order.update({
            payment_time: paymentTime,
            updated_at: paymentTime,
          });

          // 创建售票记录
          await TicketSale.create({
            sale_date: travelDate,
            train_id: train.id,
            train_number: train.train_number,
            destination: destination,
            seat_type: seatType,
            ticket_count: ticketCount,
            actual_amount: order.total_amount,
            order_id: order.id,
          });

          // 更新库存（确保库存存在）
          let inventory = await TicketInventory.findOne({
            where: {
              train_id: train.id,
              travel_date: travelDate,
              seat_type: seatType,
            },
          });

          if (!inventory) {
            let totalSeats = 0;
            if (seatType === 'business') totalSeats = train.total_seats_business;
            else if (seatType === 'first') totalSeats = train.total_seats_first;
            else if (seatType === 'second') totalSeats = train.total_seats_second;

            inventory = await TicketInventory.create({
              train_id: train.id,
              travel_date: travelDate,
              seat_type: seatType,
              total_seats: totalSeats,
              sold_seats: ticketCount,
              locked_seats: 0,
            });
          } else {
            await inventory.update({
              sold_seats: inventory.sold_seats + ticketCount,
            });
          }

          // 如果是已退款订单，创建退票记录
          if (statusConfig.status === 'refunded') {
            const serviceFeeRate = 5; // 5%手续费
            const totalAmount = parseFloat(order.total_amount);
            const serviceFee = (totalAmount * serviceFeeRate / 100).toFixed(2);
            const refundAmount = (totalAmount - parseFloat(serviceFee)).toFixed(2);

            await Refund.create({
              order_id: order.id,
              train_id: train.id,
              departure_time: new Date(travelDate + 'T' + train.departure_time),
              train_number: train.train_number,
              seat_type: seatType,
              destination: destination,
              route: `${train.departure_station}-${train.arrival_station}`,
              vehicle_type: train.vehicle_type,
              ticket_price: order.ticket_price,
              ticket_count: ticketCount,
              service_fee_rate: serviceFeeRate.toFixed(2),
              service_fee: serviceFee,
              refund_amount: refundAmount,
              refund_reason: '用户申请退款',
            });

            // 回补库存
            await inventory.update({
              sold_seats: Math.max(0, inventory.sold_seats - ticketCount),
            });

            // 创建负向售票记录
            await TicketSale.create({
              sale_date: travelDate,
              train_id: train.id,
              train_number: train.train_number,
              destination: destination,
              seat_type: seatType,
              ticket_count: -ticketCount,
              actual_amount: (-parseFloat(refundAmount)).toFixed(2),
              order_id: order.id,
            });

            console.log(`  ✅ 订单 ${order.order_number}: ${train.train_number} ${travelDate} ${seatType} ${ticketCount}张 - 已退款`);
          } else if (statusConfig.status === 'completed') {
            // 已完成订单：出行日期应该是过去
            const completedDate = new Date(travelDate);
            completedDate.setDate(completedDate.getDate() + 1); // 出行后一天
            await order.update({
              updated_at: completedDate,
            });
            console.log(`  ✅ 订单 ${order.order_number}: ${train.train_number} ${travelDate} ${seatType} ${ticketCount}张 - 已完成`);
          } else {
            console.log(`  ✅ 订单 ${order.order_number}: ${train.train_number} ${travelDate} ${seatType} ${ticketCount}张 - 已支付`);
          }
        }

        totalCreated++;
      }
    }

    console.log(`\n🎉 完成！共创建 ${totalCreated} 条订单及相关数据`);
    console.log(`📊 订单统计:`);
    for (const statusConfig of orderStatusDistribution) {
      console.log(`   - ${statusConfig.description}: ${statusConfig.count}条`);
    }
  } catch (error) {
    console.error('❌ 生成数据失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
if (require.main === module) {
  seedOrders()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export default seedOrders;

