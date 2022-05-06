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

// 设置token以及过期时间（cookies、sessionStorage各一份）
// 后端需要将用户信息和token以及过期时间都返回给前端，过期时间主要用于刷新token
export function setToken(data) {
  const { token: accessToken, expiresAt, user } = data;
  const expires = parseInt(expiresAt) - Date.now();

  // 提取关键信息进行存储
  const paramsMap: paramsMapType = {
    name: user.name,
    expires: expiresAt,
    accessToken
  };

  //格式化个人信息，存储
  function formatUserInfo(userInfo: any, expiresAt: number, accessToken: string): object {
    userInfo.expiresAt = expiresAt;
    // userInfo.expiresAt = new Date().getTime() + 5000;
    userInfo.headPic = userInfo.head_pic;
    userInfo.token = accessToken;
    userInfo.routerList = JSON.parse(userInfo.router_list);

    delete userInfo.head_pic;
    delete userInfo.router_list;

    return userInfo;
  }
  const userInfo = formatUserInfo(user, expiresAt, accessToken);
  storageSession.setItem("user-info", userInfo);
  useUserStoreHook().setUserInfo(userInfo);

  const dataString = JSON.stringify(paramsMap);
  expires > 0
    ? Cookies.set(TokenKey, dataString, {
        expires: expires / 86400000
      })
    : Cookies.set(TokenKey, dataString);
}

// 删除token
export function removeToken() {
  Cookies.remove(TokenKey);
}
