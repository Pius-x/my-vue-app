import { defineStore } from "pinia";
import { store } from "/@/store";
import { cacheType } from "./types";
import { constantMenus } from "/@/router";
import { cloneDeep } from "lodash-unified";
import { ascending, filterTree } from "/@/router/utils";

export const usePermissionStore = defineStore({
  id: "pure-permission",
  state: () => ({
    // 静态路由生成的菜单
    constantMenus,
    // 整体路由生成的菜单（静态、动态）
    wholeMenus: [],
    // 深拷贝一个菜单树，与导航菜单不突出
    menusTree: [],
    buttonAuth: [],
    // 缓存页面keepAlive
    cachePageList: []
  }),
  actions: {
    // 获取异步路由菜单
    asyncActionRoutes(routes) {
      if (this.wholeMenus.length > 0) return;
      this.wholeMenus = filterTree(ascending(this.constantMenus.concat(routes)));

      this.menusTree = cloneDeep(this.wholeMenus);
    },
    async changeSetting(routes) {
      await this.asyncActionRoutes(routes);
    },

    async changeNavbar(routes) {
      await this.asyncActionNavbar(routes);
    },

    // 获取异步路由菜单
    asyncActionNavbar(routes) {
      // if (this.wholeMenus.length > 0) return;

      function filterNavbar(constantMenus, routes) {
        const newTree = constantMenus.filter((v: { path: string }) => {
          return routes.includes(v.path);
        });
        newTree.forEach((v: { children }) => v.children && (v.children = filterNavbar(v.children, routes)));
        return newTree;
      }

      const allNavbar = this.constantMenus;
      this.wholeMenus = filterNavbar(filterTree(allNavbar), routes);
      this.menusTree = cloneDeep(this.wholeMenus);
    },

    cacheOperate({ mode, name }: cacheType) {
      switch (mode) {
        case "add":
          this.cachePageList.push(name);
          this.cachePageList = [...new Set(this.cachePageList)];
          break;
        case "delete":
          // eslint-disable-next-line no-case-declarations
          const delIndex = this.cachePageList.findIndex(v => v === name);
          delIndex !== -1 && this.cachePageList.splice(delIndex, 1);
          break;
      }
    },
    // 清空缓存页面
    clearAllCachePage() {
      this.cachePageList = [];
    }
  }
});

export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
