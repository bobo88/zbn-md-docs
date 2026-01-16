import { checkAuth } from './login/helper';
import Login from './login/Login';

export default ({ Vue, options, router, siteData, isServer }) => {
  Vue.mixin({
    // 请确保只在 beforeMount 或者 mounted 访问浏览器 / DOM 的 API
    mounted() {
      const doCheck = () => {
        if (!checkAuth()) {
          this.$dlg.modal(Login, {
            width: 400,
            height: 300,
            title: '登录认证入口（中博纳）',
            singletonKey: 'user-login',
            maxButton: false,
            closeButton: false,
            callback: (data) => {
              if (data === true) {
                // do some stuff after login
              }
            },
          });
        }
      };

      if (this.$dlg) {
        doCheck();
      } else {
        import('v-dialogs').then((resp) => {
          Vue.use(resp.default);
          this.$nextTick(() => {
            doCheck();
          });
        });
      }
    },
  });

  if (!isServer) {
    try {
      router.beforeEach((to, from, next) => {
        console.log('切换路由', to.fullPath, from.fullPath);

        // 如果没有登录
        if (!checkAuth()) {
          // console.log(11112334, router)
          if (to.fullPath.indexOf('/noAuth') === -1) {
            console.log('当前页面不是NoAuth');
            if (window && window.location) {
              window.location.href = '/noAuth/';
            }
          }
        } else if (from.fullPath === '/noAuth') {
          if (window && window.location) {
            window.location.href = '/new/';
          }
        }

        // continue
        next();
      });
    } catch (err) {
      console.log(err);
    }
  }
};
