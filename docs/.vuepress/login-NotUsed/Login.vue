<template>
  <div class="login-form">
    <div class="form-item">
      <span>用户名：</span>
      <input
        type="text"
        class="form-control"
        placeholder="请输入用户名"
        v-model.trim="username"
        @keyup.enter="login"
      />
    </div>
    <div class="form-item">
      <span>密码：</span>
      <input
        type="password"
        class="form-control"
        placeholder="请输入密码"
        v-model.trim="password"
        @keyup.enter="login"
      />
    </div>

    <div class="btn-row">
      <button class="btn" @click="login">点我登录</button>
    </div>
  </div>
</template>

<script>
  console.log(11111)
import { STORAGE_KEY } from './helper';
// import AuthManager from './auth.js';

// const authManager = new AuthManager();

console.log(STORAGE_KEY, 22)
// console.log(authManager, STORAGE_KEY, 22)

// export default {
//   data() {
//     return {
//       username: 'szzbn',
//       password: '',
//     };
//   },
//   methods: {
//     async login() {
//       if (this.username && this.password) {
//         try {
//           // 使用安全的认证系统验证用户
//           const result = await authManager.verifyCredentials(this.username, this.password);

//           if (result.success) {
//             // 创建安全会话
//             const session = authManager.createSession(result.user);

//             const data = JSON.stringify({
//               name: this.username,
//               role: result.user.role,
//               time: new Date().getTime(),
//               session: session,
//             });

//             if (window && window.location) {
//               window.localStorage.setItem(STORAGE_KEY, data);
//               this.$emit('close', true);
//               window.location.href = '/new/';
//             }
//           } else {
//             alert(result.message || '抱歉，账号密码不对');
//           }
//         } catch (error) {
//           console.error('登录错误:', error);
//           alert('登录系统错误，请稍后重试');
//         }
//       } else {
//         alert('请输入账号密码');
//       }
//     },
//   },
// };
</script>

<style scoped>
.login-form {
  display: 'flex';
  flex-direction: column;
  box-sizing: border-box;
  padding: 50px 20px;
}
.btn-row {
  margin-top: 1rem;
}
.btn {
  width: 100%;
  padding: 0.6rem 2rem;
  color: white;
  background-color: #409eff;
  border: 0;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
}
.form-item {
  display: flex;
  margin-bottom: 20px;
}
.form-item span {
  display: block;
  width: 80px;
  height: 36px;
  font-size: 14px;
  line-height: 36px;
}
.form-control {
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.6rem;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
  transition: border 0.2s ease;
}
.form-control:focus {
  font-size: 14px;
  border: 1px solid #409eff;
}
</style>