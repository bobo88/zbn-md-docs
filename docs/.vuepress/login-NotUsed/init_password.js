// 密码初始化工具 - 用于生成加密的密码哈希
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function initPasswords() {
  const configPath = path.join(__dirname, 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  console.log('开始初始化密码...');

  // 为每个用户生成密码哈希
  for (let user of config.users) {
    if (!user.passwordHash) {
      // 默认密码为 Aa111111
      const password = 'Aa111111.';
      const saltRounds = config.security.saltRounds;
      const hash = await bcrypt.hash(password, saltRounds);

      user.passwordHash = hash;
      console.log(`用户 ${user.username} 的密码已加密`);
    }
  }

  // 保存更新后的配置
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('密码初始化完成！');
  console.log('请删除此文件以确保安全');
}

// 运行初始化
if (require.main === module) {
  initPasswords().catch(console.error);
}

module.exports = initPasswords;
