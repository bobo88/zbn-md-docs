export const STORAGE_KEY = 'user_auth_szzbn688';

// Do user authorization verify
export function checkAuth() {
  const auth = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
  console.log(auth);
  if (auth && auth.time) {
    const preTime = new Date(auth.time);
    const nowTime = new Date().setHours(-24);
    if (nowTime > preTime) {
      return false;
    }
    return auth && Object.keys(auth).length;
  } else {
    return false;
  }
}
