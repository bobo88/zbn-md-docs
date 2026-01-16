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
import { STORAGE_KEY } from './helper';

export default {
  data() {
    return {
      username: 'szzbn',
      password: '',
    };
  },
  methods: {
    login() {
      if (this.username && this.password) {
        var userAndWords = { admin: '123456', szzbn: '123456' };
        var isMatchUser = false;
        for (var key in userAndWords) {
          var tempUser = key;
          var tempPassword = userAndWords[key];
          if (this.username === tempUser && this.password === tempPassword) {
            isMatchUser = true;
            break;
          }
        }

        if (isMatchUser) {
          const data = JSON.stringify({
            name: this.username,
            time: new Date().getTime(),
          });
          if (window && window.location) {
            window.localStorage.setItem(STORAGE_KEY, data);
            this.$emit('close', true);
            window.location.href = '/new/';
          }
        } else {
          alert('抱歉，账号密码不对');
        }
      } else {
        alert('请输入账号密码');
      }
    },
  },
};
</script>

<style scoped>
.login-form {
  padding: 50px 20px;
  display: 'flex';
  flex-direction: column;
  box-sizing: border-box;
}
.btn-row {
  margin-top: 1rem;
}
.btn {
  width: 100%;
  padding: 0.6rem 2rem;
  outline: none;
  background-color: #409eff;
  color: white;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}
.form-item {
  margin-bottom: 20px;
  display: flex;
}
.form-item span {
  display: block;
  width: 80px;
  height: 36px;
  line-height: 36px;
  font-size: 14px;
}
.form-control {
  border: 1px solid #ddd;
  width: 100%;
  margin-bottom: 0.5rem;
  box-sizing: border-box;
  outline: none;
  transition: border 0.2s ease;
  padding: 0.6rem;
  border-radius: 5px;
  font-size: 14px;
}
.form-control:focus {
  border: 1px solid #409eff;
  font-size: 14px;
}
</style>
