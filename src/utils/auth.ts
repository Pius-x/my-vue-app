import Cookies from "js-cookie";
import { storageSession } from "/@/utils/storage";
import { useUserStoreHook } from "/@/store/modules/user";

const TokenKey = "authorized-token";

type paramsMapType = {
  name: string;
  expires: number;
  accessToken: string;
};

// 获取token
export function getToken() {
  // 此处与TokenKey相同，此写法解决初始化时Cookies中不存在TokenKey报错
  return Cookies.get("authorized-token");
}

// 存储用户信息(cookies、sessionStorage、Pinia各一份)
export function storageUserInfo(data) {
  const { token: accessToken, expires_at: expires, name } = data;
  const leftTime = parseInt(expires) - Date.now();

  // 写会话存储和Pinia
  storageSession.setItem("user-info", data);
  useUserStoreHook().setUserInfo(data);

  // 提取关键信息进行存储Cookies
  const paramsMap: paramsMapType = {
    name,
    expires,
    accessToken
  };
  const dataString = JSON.stringify(paramsMap);
  leftTime > 0
    ? Cookies.set(TokenKey, dataString, {
        expires: leftTime / 86400000
      })
    : Cookies.set(TokenKey, dataString);
}

// 删除token
export function removeToken() {
  Cookies.remove(TokenKey);
}
