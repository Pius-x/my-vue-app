import { defineStore } from "pinia";
import { store } from "/@/store";
import { userType } from "./types";
import { router } from "/@/router";
import { storageLocal, storageSession } from "/@/utils/storage";
import { removeToken } from "/@/utils/auth";
import { RouterListRecordType } from "/@/router/types";

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
    routerList: [],
    routerMap: new Map()
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

      const routerMap: Map<string, number> = new Map<string, number>();
      userInfo.routerList &&
        userInfo.routerList.forEach((route: RouterListRecordType) => {
          const { path, readonly } = route;
          routerMap.set(path, readonly);
        });

      this.routerMap = routerMap;
    },

    // 清空缓存
    clearTokenCache() {
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
