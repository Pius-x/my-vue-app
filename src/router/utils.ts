import { RouterHistory, RouteRecordRaw, RouteComponent, createWebHistory, createWebHashHistory, RouteRecordNormalized } from "vue-router";
import { remainingPaths, router, whitePaths } from "./index";
import { loadEnv } from "../../build";
import { useTimeoutFn } from "@vueuse/core";
import { RouteConfigs } from "/@/layout/types";
import { buildHierarchyTree } from "/@/utils/tree";
import { usePermissionStoreHook } from "/@/store/modules/permission";
import { useUserStore, useUserStoreHook } from "/@/store/modules/user";
import showRouter from "/@/router/modules/showRouter";
import { isEmpty } from "/@/utils/is";
import { showMessage } from "/@/utils/message";
import { HttpResponse } from "/@/utils/http/types";
import { storageSession } from "/@/utils/storage";
const Layout = () => import("/@/layout/index.vue");
const IFrame = () => import("/@/layout/frameView.vue");
// https://cn.vitejs.dev/guide/features.html#glob-import
const modulesRoutes = import.meta.glob("/src/views/**/*.{vue,tsx}");

// 按照路由中meta下的rank等级升序来排序路由
function ascending(arr: any[]) {
  arr.forEach(v => {
    if (v?.meta?.rank === null) v.meta.rank = undefined;
    if (v?.meta?.rank === 0) {
      if (v.name !== "home" && v.path !== "/") {
        console.warn("rank only the home page can be 0");
      }
    }
  });
  return arr.sort((a: { meta: { rank: number } }, b: { meta: { rank: number } }) => {
    return a?.meta?.rank - b?.meta?.rank;
  });
}

// 过滤隐藏的路由
function filterTree(data: RouteComponent[]) {
  const newTree = data.filter((v: { path: string }) => {
    return !remainingPaths.includes(v.path);
  });
  newTree.forEach((v: { children }) => v.children && (v.children = filterTree(v.children)));
  return newTree;
}

// 批量删除缓存路由(keepalive)
function delAliveRoutes(delAliveRouteList: Array<RouteConfigs>) {
  delAliveRouteList.forEach(route => {
    usePermissionStoreHook().cacheOperate({
      mode: "delete",
      name: route?.name
    });
  });
}

// 通过path获取父级路径
function getParentPaths(path: string, routes: RouteRecordRaw[]) {
  // 深度遍历查找
  function dfs(routes: RouteRecordRaw[], path: string, parents: string[]) {
    for (let i = 0; i < routes.length; i++) {
      const item = routes[i];
      // 找到path则返回父级path
      if (item.path === path) return parents;
      // children不存在或为空则不递归
      if (!item.children || !item.children.length) continue;
      // 往下查找时将当前path入栈
      parents.push(item.path);

      if (dfs(item.children, path, parents).length) return parents;
      // 深度遍历查找未找到时当前path 出栈
      parents.pop();
    }
    // 未找到时返回空数组
    return [];
  }

  return dfs(routes, path, []);
}

// 查找对应path的路由信息
function findRouteByPath(path: string, routes: RouteRecordRaw[]) {
  let res = routes.find((item: { path: string }) => item.path == path);
  if (res) {
    return res;
  } else {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].children instanceof Array && routes[i].children.length > 0) {
        res = findRouteByPath(path, routes[i].children);
        if (res) {
          return res;
        }
      }
    }
    return null;
  }
}

//有权限的动态路由表
function dynamicRouter(): string[] {
  const { routerList, isSuperGroup } = useUserStore();

  let filterRouters: any[] = routerList;

  if (isSuperGroup) {
    filterRouters = formatFlatteningRoutes(showRouter);
  }

  const routers: string[] = filterRouters.map(item => {
    return item.path;
  });

  return [...new Set([...routers, ...remainingPaths, ...whitePaths])];
}

// 过滤无权限路由
function filterRouter(showRouters: string[]): void {
  router.getRoutes().forEach(route => {
    const { name, path } = route;

    if (name && !showRouters.includes(path)) {
      //删除路由权限
      router.hasRoute(name) && router.removeRoute(name);
    }
  });
}

// 初始化路由
function initRouter() {
  return new Promise(resolve => {
    //可展示的路由
    const showRouters = dynamicRouter();
    //过滤无权限的路由
    filterRouter(showRouters);
    resolve(router);
    //过滤无权限的导航栏
    usePermissionStoreHook().changeNavbar(showRouters).then();

    router.addRoute({
      path: "/:pathMatch(.*)",
      redirect: "/error/404"
    });
  });
}

// 刷新路由
async function refreshRouter(userInfo) {
  const { id } = userInfo;
  let gid = 0;
  let routerList = [
    { path: "/", readonly: 0 },
    { path: "/welcome", readonly: 0 }
  ];
  await http.get("user/getUserInfoById", { id }).then((data: HttpResponse) => {
    if (data.code === 0) {
      routerList = data.data.router_list;
      gid = data.data.gid;
    }
  });

  userInfo.router_list = routerList;
  userInfo.gid = gid;

  // 更新回话存储和Pinia
  storageSession.setItem("user-info", userInfo);
  useUserStoreHook().setUserInfo(userInfo);

  return routerList;
}

/**
 * 将多级嵌套路由处理成一维数组
 * @param routesList 传入路由
 * @returns 返回处理后的一维路由
 */
function formatFlatteningRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  let hierarchyList = buildHierarchyTree(routesList);
  for (let i = 0; i < hierarchyList.length; i++) {
    if (hierarchyList[i].children) {
      hierarchyList = hierarchyList.slice(0, i + 1).concat(hierarchyList[i].children, hierarchyList.slice(i + 1));
    }
  }
  return hierarchyList;
}

/**
 * 一维数组处理成多级嵌套数组（三级及以上的路由全部拍成二级，keep-alive 只支持到二级缓存）
 * https://github.com/xiaoxian521/vue-pure-admin/issues/67
 * @param routesList 处理后的一维路由菜单数组
 * @returns 返回将一维数组重新处理成规定路由的格式
 */
function formatTwoStageRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  const newRoutesList: RouteRecordRaw[] = [];
  routesList.forEach((v: RouteRecordRaw) => {
    if (v.path === "/") {
      newRoutesList.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: []
      });
    } else {
      newRoutesList[0].children.push({ ...v });
    }
  });
  return newRoutesList;
}

// 处理缓存路由（添加、删除、刷新）
function handleAliveRoute(matched: RouteRecordNormalized[], mode?: string) {
  switch (mode) {
    case "add":
      matched.forEach(v => {
        usePermissionStoreHook().cacheOperate({ mode: "add", name: v.name });
      });
      break;
    case "delete":
      usePermissionStoreHook().cacheOperate({
        mode: "delete",
        name: matched[matched.length - 1].name
      });
      break;
    default:
      usePermissionStoreHook().cacheOperate({
        mode: "delete",
        name: matched[matched.length - 1].name
      });
      useTimeoutFn(() => {
        matched.forEach(v => {
          usePermissionStoreHook().cacheOperate({ mode: "add", name: v.name });
        });
      }, 100);
  }
}

// 过滤后端传来的动态路由 重新生成规范路由
function addAsyncRoutes(arrRoutes: Array<RouteRecordRaw>) {
  if (!arrRoutes || !arrRoutes.length) return;
  const modulesRoutesKeys = Object.keys(modulesRoutes);
  arrRoutes.forEach((v: RouteRecordRaw) => {
    if (v.redirect) {
      v.component = Layout;
    } else if (v.meta?.frameSrc) {
      v.component = IFrame;
    } else {
      // 对后端传component组件路径和不传做兼容（如果后端传component组件路径，那么path可以随便写，如果不传，component组件路径会根path保持一致）
      const index = v?.component
        ? // @ts-expect-error
          modulesRoutesKeys.findIndex(ev => ev.includes(v.component))
        : modulesRoutesKeys.findIndex(ev => ev.includes(v.path));
      v.component = modulesRoutes[modulesRoutesKeys[index]];
    }
    if (v.children) {
      addAsyncRoutes(v.children);
    }
  });
  return arrRoutes;
}

// 获取路由历史模式 https://next.router.vuejs.org/zh/guide/essentials/history-mode.html
function getHistoryMode(): RouterHistory {
  const routerHistory = loadEnv().VITE_ROUTER_HISTORY;
  // len为1 代表只有历史模式 为2 代表历史模式中存在base参数 https://next.router.vuejs.org/zh/api/#%E5%8F%82%E6%95%B0-1
  const historyMode = routerHistory.split(",");
  const leftMode = historyMode[0];
  const rightMode = historyMode[1];
  // no param
  if (historyMode.length === 1) {
    if (leftMode === "hash") {
      return createWebHashHistory("");
    } else if (leftMode === "h5") {
      return createWebHistory("");
    }
  } //has param
  else if (historyMode.length === 2) {
    if (leftMode === "hash") {
      return createWebHashHistory(rightMode);
    } else if (leftMode === "h5") {
      return createWebHistory(rightMode);
    }
  }
}

// 是否有写权限
function hasPermissions(): boolean {
  waitRouterReady().then();
  const curRouter = router.currentRoute.value.path;

  const routerMap = useUserStore().routerMap;
  if ((curRouter !== "/login" && isEmpty(routerMap) === false && routerMap.get(curRouter)) ?? 1 === 1) {
    showMessage(`${curRouter} 你只拥有当前页面的读权限！`, "error");
    return false;
  }
  return true;
}

async function waitRouterReady() {
  await router.isReady();
}

export {
  ascending,
  filterTree,
  initRouter,
  refreshRouter,
  hasPermissions,
  getHistoryMode,
  addAsyncRoutes,
  delAliveRoutes,
  getParentPaths,
  findRouteByPath,
  handleAliveRoute,
  formatTwoStageRoutes,
  formatFlatteningRoutes
};
