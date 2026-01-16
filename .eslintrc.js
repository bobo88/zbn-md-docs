// .eslintrc.js
module.exports = {
  extends: [require.resolve("@umijs/fabric/dist/eslint")],
  globals: {
    // 全局变量:在全局中使用 REACT_APP_ENV时  eslint就不会出现警告
    REACT_APP_ENV: true,
  },
};