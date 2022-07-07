import { defineStore } from "pinia";
import { store } from "/@/store";
import { userType } from "./types";
import { router } from "/@/router";
import { storageLocal, storageSession } from "/@/utils/storage";
import { removeToken } from "/@/utils/auth";
import { RouterListRecordType } from "/@/router/types";
import dayjs from "dayjs";

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
    lastLoginTime: "",
    bindFs: false,
    isSuperGroup: false,
    isRootUser: false,
    fsName: "",
    fsHeadPic: "",
    routerList: [],
    routerMap: new Map()
  }),
  actions: {
    setUserInfo(userInfo) {
      this.id = userInfo.id;
      this.account = userInfo.account;
      this.expiresAt = userInfo.expires_at;
      this.token = userInfo.token;
      this.gid = userInfo.gid;
      this.headPic = userInfo.head_pic;
      this.name = userInfo.name;
      this.lastLoginTime = dayjs(userInfo.last_login_time * 1000).format("YYYY-MM-DD HH:mm:ss");
      this.bindFs = userInfo.bind_fs;
      this.isSuperGroup = userInfo.gid === 0;
      this.isRootUser = userInfo.account === "root";
      this.fsName = userInfo.fs_name;
      this.fsHeadPic = userInfo.fs_head_pic;
      this.routerList = userInfo.router_list;

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
