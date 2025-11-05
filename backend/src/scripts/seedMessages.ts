/**
 * 生成留言假数据脚本
 * 为用户ID=3生成留言数据，包括管理员回复
 */

import { sequelize } from '../config/database';
import Message, { MessageStatus } from '../models/Message';
import User from '../models/User';

const USER_ID = 3; // lqy用户ID

// 留言内容模板
const messageContents = [
  '这个购票系统真的很方便，操作简单快捷！',
  '希望可以增加更多车次选择，特别是节假日期间。',
  '支付功能很流畅，没有遇到任何问题。',
  '建议增加退票提醒功能，避免忘记退票。',
  '系统界面设计很美观，用户体验很好。',
  '希望能支持更多支付方式，比如支付宝、微信支付。',
  '车票查询功能很强大，可以快速找到合适的车次。',
  '建议增加车次延误提醒功能。',
  '整体服务很满意，会继续使用。',
  '希望能增加座位选择功能，可以提前选座。',
  '系统响应速度很快，点个赞！',
  '建议增加积分系统，购票可以积分。',
  '客服回复很及时，服务态度很好。',
  '希望能增加车次实时信息查询。',
  '系统很稳定，没有遇到过bug。',
  '建议增加多语言支持功能。',
  '购票流程很顺畅，非常满意。',
  '希望能增加车次评价功能。',
  '系统安全性很好，值得信赖。',
  '建议增加优惠券功能，可以打折购票。',
];

// 管理员回复模板
const adminReplies = [
  '感谢您的反馈，我们会继续优化系统功能！',
  '您的建议非常好，我们会在后续版本中考虑加入。',
  '感谢您的支持，我们会努力提供更好的服务！',
  '我们会认真考虑您的建议，感谢您的关注！',
  '感谢您的使用，有任何问题随时联系我们！',
  '您的意见对我们很重要，我们会持续改进！',
  '感谢您的认可，我们会继续努力！',
  '我们会认真评估您的建议，感谢反馈！',
];

// 留言状态配置
const messageStatusDistribution: Array<{ status: MessageStatus; count: number; description: string; hasReply: boolean }> = [
  { status: 'pending', count: 5, description: '待审核留言', hasReply: false },
  { status: 'approved', count: 12, description: '已通过留言', hasReply: true }, // 部分有回复
  { status: 'rejected', count: 3, description: '已拒绝留言', hasReply: false },
];

// 生成日期（过去30天）
function getMessageDate(offsetDays: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return date;
}

// 生成回复时间（留言创建后1-7天）
function getReplyTime(createdAt: Date): Date {
  const replyTime = new Date(createdAt);
  const days = 1 + Math.floor(Math.random() * 7);
  replyTime.setDate(replyTime.getDate() + days);
  return replyTime;
}

async function seedMessages() {
  try {
    console.log('🚀 开始生成留言数据...');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 检查用户是否存在
    const user = await User.findByPk(USER_ID);
    if (!user) {
      throw new Error(`用户ID ${USER_ID} 不存在`);
    }
    console.log(`✅ 找到用户: ${user.username} (ID: ${USER_ID})`);

    // 检查是否已有留言数据
    const existingMessages = await Message.findAll({ where: { user_id: USER_ID } });
    if (existingMessages.length > 0) {
      console.log(`⚠️  用户已有 ${existingMessages.length} 条留言，将跳过已有数据`);
    }

    let createdCount = 0;
    let contentIndex = 0;
    let replyIndex = 0;

    // 按状态生成留言
    for (const statusConfig of messageStatusDistribution) {
      console.log(`\n📝 生成 ${statusConfig.description} (${statusConfig.count}条)...`);
      
      for (let i = 0; i < statusConfig.count; i++) {
        // 选择留言内容（循环使用）
        const content = messageContents[contentIndex % messageContents.length];
        contentIndex++;

        // 生成创建时间（过去30天）
        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = getMessageDate(daysAgo);

        // 创建留言
        const message = await Message.create({
          user_id: USER_ID,
          username: user.username,
          content: content,
          status: statusConfig.status,
          reply: null,
          reply_time: null,
          created_at: createdAt,
          updated_at: createdAt,
        });

        // 如果是已通过且有回复的留言，添加管理员回复
        if (statusConfig.status === 'approved' && statusConfig.hasReply) {
          // 60%的概率添加回复（让更多留言有回复）
          if (Math.random() > 0.4) {
            const reply = adminReplies[replyIndex % adminReplies.length];
            replyIndex++;
            const replyTime = getReplyTime(createdAt);
            
            await message.update({
              reply: reply,
              reply_time: replyTime,
              updated_at: replyTime,
            });
            
            console.log(`  ✅ 留言 ${message.id}: ${content.substring(0, 20)}... - 已通过（有管理员回复）`);
          } else {
            console.log(`  ✅ 留言 ${message.id}: ${content.substring(0, 20)}... - 已通过（无回复）`);
          }
        } else if (statusConfig.status === 'pending') {
          console.log(`  ✅ 留言 ${message.id}: ${content.substring(0, 20)}... - 待审核`);
        } else if (statusConfig.status === 'rejected') {
          console.log(`  ✅ 留言 ${message.id}: ${content.substring(0, 20)}... - 已拒绝`);
        }

        createdCount++;
      }
    }

    console.log(`\n🎉 完成！共创建 ${createdCount} 条留言`);
    console.log(`📊 留言统计:`);
    for (const statusConfig of messageStatusDistribution) {
      console.log(`   - ${statusConfig.description}: ${statusConfig.count}条`);
    }

    // 显示有回复的留言
    const messagesWithReply = await Message.findAll({
      where: { 
        user_id: USER_ID,
        reply: { [require('sequelize').Op.ne]: null }
      },
      order: [['created_at', 'DESC']],
    });
    
    if (messagesWithReply.length > 0) {
      console.log(`\n💬 有管理员回复的留言 (${messagesWithReply.length}条):`);
      messagesWithReply.forEach((msg, index) => {
        console.log(`   ${index + 1}. [${msg.status}] ${msg.content.substring(0, 30)}...`);
        if (msg.reply) {
          console.log(`      回复: ${msg.reply.substring(0, 30)}...`);
        }
      });
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
  seedMessages()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export default seedMessages;

