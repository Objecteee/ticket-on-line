/**
 * 生成车次假数据脚本
 * 生成大量真实的车次数据，包括停靠站信息
 */

import { sequelize } from '../config/database';
import Train from '../models/Train';
import TrainStop from '../models/TrainStop';

// 真实的中国主要车站
const stations = [
  '北京南', '北京西', '北京', '上海虹桥', '上海', '上海南',
  '广州南', '广州', '深圳北', '深圳', '杭州东', '杭州',
  '南京南', '南京', '武汉', '汉口', '成都东', '成都',
  '重庆北', '重庆', '西安北', '西安', '郑州东', '郑州',
  '长沙南', '长沙', '天津', '天津西', '济南', '济南西',
  '青岛', '青岛北', '石家庄', '石家庄北', '太原', '太原南',
  '沈阳', '沈阳北', '大连', '大连北', '哈尔滨', '哈尔滨西',
  '长春', '长春西', '合肥', '合肥南', '福州', '福州南',
  '厦门', '厦门北', '南昌', '南昌西', '南宁', '南宁东',
  '昆明', '昆明南', '贵阳', '贵阳北', '拉萨', '乌鲁木齐'
];

// 车次类型配置
interface TrainTypeConfig {
  prefix: string; // 车次前缀
  type: string; // 车型
  businessSeats: number; // 商务座数量
  firstSeats: number; // 一等座数量
  secondSeats: number; // 二等座数量
  businessPrice: number; // 商务座每公里价格
  firstPrice: number; // 一等座每公里价格
  secondPrice: number; // 二等座每公里价格
}

const trainTypes: TrainTypeConfig[] = [
  {
    prefix: 'G',
    type: '高速动车组',
    businessSeats: 20,
    firstSeats: 50,
    secondSeats: 500,
    businessPrice: 0.8,
    firstPrice: 0.5,
    secondPrice: 0.3,
  },
  {
    prefix: 'D',
    type: '动车组',
    businessSeats: 0,
    firstSeats: 40,
    secondSeats: 600,
    businessPrice: 0,
    firstPrice: 0.4,
    secondPrice: 0.25,
  },
  {
    prefix: 'C',
    type: '城际动车',
    businessSeats: 0,
    firstSeats: 30,
    secondSeats: 500,
    businessPrice: 0,
    firstPrice: 0.35,
    secondPrice: 0.22,
  },
  {
    prefix: 'K',
    type: '快速列车',
    businessSeats: 0,
    firstSeats: 0,
    secondSeats: 800,
    businessPrice: 0,
    firstPrice: 0,
    secondPrice: 0.15,
  },
];

// 生成车次数据
const trainData = [
  // G字头高铁 - 京沪线
  {
    train_number: 'G1',
    departure_station: '北京南',
    arrival_station: '上海虹桥',
    stops: ['北京南', '天津南', '济南西', '南京南', '上海虹桥'],
    departure_time: '06:00',
    arrival_time: '11:30',
    type: trainTypes[0],
    distance: 1318, // 公里
  },
  {
    train_number: 'G2',
    departure_station: '上海虹桥',
    arrival_station: '北京南',
    stops: ['上海虹桥', '南京南', '济南西', '天津南', '北京南'],
    departure_time: '07:00',
    arrival_time: '12:30',
    type: trainTypes[0],
    distance: 1318,
  },
  {
    train_number: 'G101',
    departure_station: '北京南',
    arrival_station: '上海虹桥',
    stops: ['北京南', '德州东', '济南西', '曲阜东', '徐州东', '南京南', '镇江南', '上海虹桥'],
    departure_time: '08:00',
    arrival_time: '13:48',
    type: trainTypes[0],
    distance: 1318,
  },
  
  // G字头 - 京广线
  {
    train_number: 'G65',
    departure_station: '北京西',
    arrival_station: '广州南',
    stops: ['北京西', '石家庄', '郑州东', '武汉', '长沙南', '广州南'],
    departure_time: '09:00',
    arrival_time: '17:30',
    type: trainTypes[0],
    distance: 2298,
  },
  {
    train_number: 'G66',
    departure_station: '广州南',
    arrival_station: '北京西',
    stops: ['广州南', '长沙南', '武汉', '郑州东', '石家庄', '北京西'],
    departure_time: '10:00',
    arrival_time: '18:30',
    type: trainTypes[0],
    distance: 2298,
  },
  
  // G字头 - 沪杭线
  {
    train_number: 'G7301',
    departure_station: '上海虹桥',
    arrival_station: '杭州东',
    stops: ['上海虹桥', '嘉兴南', '杭州东'],
    departure_time: '06:30',
    arrival_time: '07:45',
    type: trainTypes[0],
    distance: 159,
  },
  {
    train_number: 'G7302',
    departure_station: '杭州东',
    arrival_station: '上海虹桥',
    stops: ['杭州东', '嘉兴南', '上海虹桥'],
    departure_time: '08:00',
    arrival_time: '09:15',
    type: trainTypes[0],
    distance: 159,
  },
  
  // D字头 - 京沪线
  {
    train_number: 'D301',
    departure_station: '北京南',
    arrival_station: '上海',
    stops: ['北京南', '天津', '济南', '徐州', '南京', '上海'],
    departure_time: '21:00',
    arrival_time: '09:30',
    type: trainTypes[1],
    distance: 1463,
  },
  {
    train_number: 'D302',
    departure_station: '上海',
    arrival_station: '北京南',
    stops: ['上海', '南京', '徐州', '济南', '天津', '北京南'],
    departure_time: '20:30',
    arrival_time: '09:00',
    type: trainTypes[1],
    distance: 1463,
  },
  
  // D字头 - 广深线
  {
    train_number: 'D7101',
    departure_station: '广州',
    arrival_station: '深圳',
    stops: ['广州', '东莞', '深圳'],
    departure_time: '07:00',
    arrival_time: '08:30',
    type: trainTypes[1],
    distance: 147,
  },
  {
    train_number: 'D7102',
    departure_station: '深圳',
    arrival_station: '广州',
    stops: ['深圳', '东莞', '广州'],
    departure_time: '09:00',
    arrival_time: '10:30',
    type: trainTypes[1],
    distance: 147,
  },
  
  // C字头 - 京津城际
  {
    train_number: 'C2001',
    departure_station: '北京南',
    arrival_station: '天津',
    stops: ['北京南', '武清', '天津'],
    departure_time: '06:15',
    arrival_time: '07:00',
    type: trainTypes[2],
    distance: 120,
  },
  {
    train_number: 'C2002',
    departure_station: '天津',
    arrival_station: '北京南',
    stops: ['天津', '武清', '北京南'],
    departure_time: '07:30',
    arrival_time: '08:15',
    type: trainTypes[2],
    distance: 120,
  },
  
  // K字头 - 京沪线
  {
    train_number: 'K101',
    departure_station: '北京',
    arrival_station: '上海',
    stops: ['北京', '天津', '济南', '徐州', '南京', '无锡', '苏州', '上海'],
    departure_time: '22:00',
    arrival_time: '14:30',
    type: trainTypes[3],
    distance: 1463,
  },
  {
    train_number: 'K102',
    departure_station: '上海',
    arrival_station: '北京',
    stops: ['上海', '苏州', '无锡', '南京', '徐州', '济南', '天津', '北京'],
    departure_time: '20:00',
    arrival_time: '12:30',
    type: trainTypes[3],
    distance: 1463,
  },
  
  // G字头 - 成渝线
  {
    train_number: 'G8501',
    departure_station: '成都东',
    arrival_station: '重庆北',
    stops: ['成都东', '内江北', '重庆北'],
    departure_time: '08:00',
    arrival_time: '10:30',
    type: trainTypes[0],
    distance: 308,
  },
  {
    train_number: 'G8502',
    departure_station: '重庆北',
    arrival_station: '成都东',
    stops: ['重庆北', '内江北', '成都东'],
    departure_time: '11:00',
    arrival_time: '13:30',
    type: trainTypes[0],
    distance: 308,
  },
  
  // G字头 - 武广线
  {
    train_number: 'G1001',
    departure_station: '武汉',
    arrival_station: '广州南',
    stops: ['武汉', '长沙南', '衡阳东', '韶关', '广州南'],
    departure_time: '07:30',
    arrival_time: '12:00',
    type: trainTypes[0],
    distance: 1069,
  },
  {
    train_number: 'G1002',
    departure_station: '广州南',
    arrival_station: '武汉',
    stops: ['广州南', '韶关', '衡阳东', '长沙南', '武汉'],
    departure_time: '13:00',
    arrival_time: '17:30',
    type: trainTypes[0],
    distance: 1069,
  },
  
  // G字头 - 京哈线
  {
    train_number: 'G1201',
    departure_station: '北京',
    arrival_station: '哈尔滨西',
    stops: ['北京', '天津', '沈阳北', '长春西', '哈尔滨西'],
    departure_time: '08:30',
    arrival_time: '17:00',
    type: trainTypes[0],
    distance: 1248,
  },
  {
    train_number: 'G1202',
    departure_station: '哈尔滨西',
    arrival_station: '北京',
    stops: ['哈尔滨西', '长春西', '沈阳北', '天津', '北京'],
    departure_time: '09:00',
    arrival_time: '17:30',
    type: trainTypes[0],
    distance: 1248,
  },
];

// 计算时间增加（小时和分钟）
function addTime(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

// 生成停靠站时间
function generateStopTimes(stops: string[], departureTime: string, arrivalTime: string): Array<{ station_name: string; stop_order: number; arrival_time: string; departure_time: string }> {
  const stopCount = stops.length;
  const [depHours, depMins] = departureTime.split(':').map(Number);
  const [arrHours, arrMins] = arrivalTime.split(':').map(Number);
  
  const depTotalMins = depHours * 60 + depMins;
  const arrTotalMins = arrHours * 60 + arrMins;
  const totalMinutes = arrTotalMins >= depTotalMins 
    ? arrTotalMins - depTotalMins 
    : (24 * 60 - depTotalMins) + arrTotalMins;
  
  const intervalMinutes = Math.floor(totalMinutes / (stopCount - 1));
  
  return stops.map((station, index) => {
    const minutesFromStart = index * intervalMinutes;
    const arrival = addTime(departureTime, minutesFromStart);
    // 始发站和终点站停靠时间稍长，中间站停靠2-5分钟
    const stopDuration = index === 0 || index === stops.length - 1 ? 0 : 2 + Math.floor(Math.random() * 4);
    const departure = index === stops.length - 1 ? arrival : addTime(arrival, stopDuration);
    
    return {
      station_name: station,
      stop_order: index + 1,
      arrival_time: arrival,
      departure_time: departure,
    };
  });
}

async function seedTrains() {
  try {
    console.log('🚀 开始生成车次数据...');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 清空现有数据（可选，注释掉可以追加数据）
    // await TrainStop.destroy({ where: {}, truncate: true });
    // await Train.destroy({ where: {}, truncate: true });
    // console.log('✅ 已清空现有车次数据');

    let createdCount = 0;

    for (const trainInfo of trainData) {
      // 检查车次是否已存在
      const existing = await Train.findOne({ where: { train_number: trainInfo.train_number } });
      if (existing) {
        console.log(`⏭️  车次 ${trainInfo.train_number} 已存在，跳过`);
        continue;
      }

      // 计算票价（基于距离）
      const businessPrice = trainInfo.type.businessPrice > 0 
        ? (trainInfo.distance * trainInfo.type.businessPrice).toFixed(2)
        : '0.00';
      const firstPrice = trainInfo.type.firstPrice > 0 
        ? (trainInfo.distance * trainInfo.type.firstPrice).toFixed(2)
        : '0.00';
      const secondPrice = trainInfo.type.secondPrice > 0 
        ? (trainInfo.distance * trainInfo.type.secondPrice).toFixed(2)
        : '0.00';

      // 创建车次
      const train = await Train.create({
        train_number: trainInfo.train_number,
        departure_station: trainInfo.departure_station,
        arrival_station: trainInfo.arrival_station,
        intermediate_stations: JSON.stringify(trainInfo.stops.slice(1, -1)),
        departure_time: trainInfo.departure_time,
        arrival_time: trainInfo.arrival_time,
        vehicle_type: trainInfo.type.type,
        total_seats_business: trainInfo.type.businessSeats,
        total_seats_first: trainInfo.type.firstSeats,
        total_seats_second: trainInfo.type.secondSeats,
        price_business: businessPrice,
        price_first: firstPrice,
        price_second: secondPrice,
        status: 1,
      });

      // 生成停靠站数据
      const stops = generateStopTimes(
        trainInfo.stops,
        trainInfo.departure_time,
        trainInfo.arrival_time
      );

      await TrainStop.bulkCreate(
        stops.map(stop => ({
          train_id: train.id,
          station_name: stop.station_name,
          stop_order: stop.stop_order,
          arrival_time: stop.arrival_time,
          departure_time: stop.departure_time,
        }))
      );

      createdCount++;
      console.log(`✅ 已创建车次 ${trainInfo.train_number}: ${trainInfo.departure_station} → ${trainInfo.arrival_station}`);
    }

    console.log(`\n🎉 完成！共创建 ${createdCount} 个车次及停靠站数据`);
  } catch (error) {
    console.error('❌ 生成数据失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
if (require.main === module) {
  seedTrains()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export default seedTrains;

