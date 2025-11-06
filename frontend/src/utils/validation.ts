/**
 * 表单验证规则
 */
import { Rule } from 'antd/es/form';

/**
 * 用户名验证规则
 */
export const usernameRules: Rule[] = [
  { required: true, message: '请输入用户名' },
  { min: 3, max: 20, message: '用户名长度应在3-20个字符之间' },
  { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
];

/**
 * 密码验证规则
 */
export const passwordRules: Rule[] = [
  { required: true, message: '请输入密码' },
  { min: 6, max: 20, message: '密码长度应在6-20个字符之间' },
];

/**
 * 确认密码验证规则
 */
export const confirmPasswordRules = (_getFieldValue: any): Rule[] => [
  { required: true, message: '请确认密码' },
  ({ getFieldValue: getValue }) => ({
    validator(_: any, value: string) {
      if (!value || getValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('两次输入的密码不一致'));
    },
  }),
];

/**
 * 邮箱验证规则
 */
export const emailRules: Rule[] = [
  { type: 'email', message: '请输入有效的邮箱地址' },
];

/**
 * 手机号验证规则
 */
export const phoneRules: Rule[] = [
  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
];

