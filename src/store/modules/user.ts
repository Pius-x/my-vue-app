import { defineStore } from "pinia";
import { store } from "/@/store";
import { userType } from "./types";
import { router } from "/@/router";
import { storageLocal, storageSession } from "/@/utils/storage";
import { setToken, removeToken } from "/@/utils/auth";
import { http } from "/@/utils/http";
import { HttpResponse } from "/@/utils/http/types";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    id: 0,
    account: "",
    expiresAt: 0,
    token: "",
    gid: 0,
    headPic: 0,
    name: "",
    routerList: []
  }),
  actions: {
    setUserInfo(userInfo) {
      this.id = userInfo.id;
      this.account = userInfo.account;
      this.expiresAt = userInfo.expiresAt;
      this.token = userInfo.token;
      this.gid = userInfo.gid;
      this.headPic = userInfo.headPic;
      this.name = userInfo.name;
      this.routerList = userInfo.routerList;
    },
    // 登入，数据缓存
    async loginByUsername(data) {
      return new Promise<void>((resolve, reject) => {
        http
          .post("base/login", data, false)
          .then((data: HttpResponse) => {
            setToken(data.data);
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    // 登出 清空缓存
    logOut() {
      this.token = "";
      this.name = "";
      removeToken();
      storageSession.clear();
      storageLocal.clear();
      router.push("/login");

      //刷新页面
      location.reload();
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
