// 密码加密和验证工具
const bcrypt = require('bcryptjs');

class AuthManager {
  constructor() {
    this.config = require('./config.json');
  }

  // 验证用户名和密码
  async verifyCredentials(username, password) {
    try {
      const user = this.config.users.find((u) => u.username === username);
      if (!user) {
        return { success: false, message: '用户不存在' };
      }

      // 使用bcrypt验证密码
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (isValid) {
        return {
          success: true,
          message: '登录成功',
          user: { username: user.username, role: user.role },
        };
      } else {
        return { success: false, message: '密码错误' };
      }
    } catch (error) {
      console.error('验证失败:', error);
      return { success: false, message: '验证失败' };
    }
  }

  // 生成密码哈希（用于初始化配置）
  async generateHash(password) {
    const saltRounds = this.config.security.saltRounds;
    return await bcrypt.hash(password, saltRounds);
  }

  // 检查会话是否有效
  checkSession(sessionData) {
    if (!sessionData || !sessionData.timestamp) {
      return false;
    }

    const currentTime = Date.now();
    const sessionAge = currentTime - sessionData.timestamp;
    return sessionAge < this.config.security.sessionTimeout;
  }

  // 创建会话
  createSession(user) {
    return {
      user: user,
      timestamp: Date.now(),
      expires: Date.now() + this.config.security.sessionTimeout,
    };
  }
}

module.exports = AuthManager;
