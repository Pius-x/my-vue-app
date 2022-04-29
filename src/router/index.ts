import { isUrl } from "/@/utils/is";
import { toRouteType } from "./types";
import { openLink } from "/@/utils/link";
import NProgress from "/@/utils/progress";
import { findIndex } from "lodash-unified";
import { storageSession } from "/@/utils/storage";
import { buildHierarchyTree } from "/@/utils/tree";
import { useMultiTagsStoreHook } from "/@/store/modules/multiTags";
import { usePermissionStoreHook } from "/@/store/modules/permission";
import { Router, RouteMeta, createRouter, RouteRecordRaw, RouteRecordName } from "vue-router";
import {
  initRouter,
  getHistoryMode,
  getParentPaths,
  findRouteByPath,
  handleAliveRoute,
  formatTwoStageRoutes,
  formatFlatteningRoutes
} from "./utils";

// 原始静态路由（未做任何处理）
import showRouter from "./modules/showRouter";
import hideRouter from "./modules/hideRouter";
import { changeTitle } from "/@/utils/func";
import { useUserStoreHook } from "/@/store/modules/user";

// 用于渲染菜单，保持原始层级
export const constantMenus: Array<RouteRecordRaw> = showRouter.concat(hideRouter);

// 导出处理后的静态路由（三级及以上的路由全部拍成二级）
export const constantRoutes: Array<RouteRecordRaw> = formatTwoStageRoutes(formatFlatteningRoutes(buildHierarchyTree(showRouter)));

// 不参与菜单的路由
export const remainingPaths = formatFlatteningRoutes(hideRouter).map(v => {
  return v.path;
});

// 创建路由实例
export const router: Router = createRouter({
  history: getHistoryMode(),
  routes: constantRoutes.concat(hideRouter),
  strict: true,
  scrollBehavior(to, from, savedPosition) {
    return new Promise(resolve => {
      if (savedPosition) {
        return savedPosition;
      } else {
        if (from.meta.saveSrollTop) {
          const top: number = document.documentElement.scrollTop || document.body.scrollTop;
          resolve({ left: 0, top });
        }
      }
    });
  }
});

// 路由白名单
const whiteList = ["/login"];

router.beforeEach((to: toRouteType, _from, next) => {
  if (to.meta?.keepAlive) {
    const newMatched = to.matched;
    handleAliveRoute(newMatched, "add");
    // 页面整体刷新和点击标签页刷新
    if (_from.name === undefined || _from.name === "redirect") {
      handleAliveRoute(newMatched);
    }
  }
  const userInfo = storageSession.getItem("user-info");
  NProgress.start();
  const externalLink = isUrl(to?.name);
  if (!externalLink)
    to.matched.some(item => {
      if (!item.meta.title) return "";
      changeTitle(item.meta);
    });

  //判断是否登录
  if (userInfo) {
    //恢复个人信息
    useUserStoreHook().setUserInfo(userInfo);
    if (_from?.name) {
      // name为超链接
      if (externalLink) {
        openLink(to?.name);
        NProgress.done();
      } else {
        next();
      }
    } else {
      // 点击刷新时 更新路由
      if (usePermissionStoreHook().wholeMenus.length === 0) {
        //刷新的时候初始化路由
        initRouter().then((router: Router) => {
          //恢复标签信息
          if (!useMultiTagsStoreHook().getMultiTagsCache) {
            const handTag = (path: string, parentPath: string, name: RouteRecordName, meta: RouteMeta): void => {
              useMultiTagsStoreHook().handleTags("push", {
                path,
                parentPath,
                name,
                meta
              });
            };
            // 未开启标签页缓存，刷新页面重定向到顶级路由（参考标签页操作例子，只针对静态路由）
            if (to.meta?.refreshRedirect) {
              const routes = router.options.routes;
              const { refreshRedirect } = to.meta;
              const { name, meta } = findRouteByPath(refreshRedirect, routes);
              handTag(refreshRedirect, getParentPaths(refreshRedirect, routes)[1], name, meta);
              return router.push(refreshRedirect);
            } else {
              const { path } = to;
              const index = findIndex(hideRouter, v => {
                return v.path == path;
              });
              const routes = index === -1 ? router.options.routes[0].children : router.options.routes;
              const route = findRouteByPath(path, routes);
              const routePartent = getParentPaths(path, routes);
              // 未开启标签页缓存，刷新页面重定向到顶级路由（参考标签页操作例子，只针对动态路由）
              if (path !== routes[0].path && route?.meta?.rank !== 0 && routePartent.length === 0) {
                if (!route?.meta?.refreshRedirect) return;
                const { name, meta } = findRouteByPath(route.meta.refreshRedirect, routes);
                handTag(route.meta?.refreshRedirect, getParentPaths(route.meta?.refreshRedirect, routes)[0], name, meta);
                return router.push(route.meta?.refreshRedirect);
              } else {
                handTag(route.path, routePartent[routePartent.length - 1], route.name, route.meta);
                return router.push(path);
              }
            }
          }
          router.push(to.fullPath);
        });
      }
      next();
    }
  } else {
    if (to.path !== "/login") {
      if (whiteList.indexOf(to.path) !== -1) {
        next();
      } else {
        next({ path: "/login" });
      }
    } else {
      next();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
