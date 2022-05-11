import { RouteRecordRaw } from "vue-router";
import EpHomeFilled from "~icons/ep/home-filled";
import EpLollipop from "~icons/ep/lollipop";
import { shallowRef } from "vue";
const Layout = () => import("/@/layout/index.vue");

//可见的路由表（根据用户权限判断最终是否展示）
const showRouter: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: Layout,
    redirect: "/welcome",
    meta: {
      icon: shallowRef(EpHomeFilled),
      title: "首页",
      rank: 0
    },
    children: [
      {
        path: "/welcome",
        name: "welcome",
        component: () => import("/@/views/welcome.vue"),
        meta: {
          title: "首页"
        }
      }
    ]
  },
  {
    path: "/permission",
    name: "permission",
    redirect: "/permission/page/index",
    meta: {
      title: "权限管理",
      icon: shallowRef(EpLollipop),
      rank: 7
    },
    children: [
      {
        path: "/permission/page",
        component: () => import("/@/views/permission/page/index.vue"),
        name: "permissionPage",
        meta: {
          title: "页面权限",
          extraIcon: {
            svg: true,
            name: "team-iconxinpin"
          }
        }
      },
      {
        path: "/permission/button",
        name: "permissionButton",
        component: () => import("/@/views/permission/button/index.vue"),

        meta: {
          title: "按钮权限"
        }
      }
    ]
  },
  {
    path: "/system",
    name: "system",
    redirect: "/system/user/index",
    meta: {
      title: "权限管理",
      icon: shallowRef(EpLollipop),
      rank: 7
    },
    children: [
      {
        path: "/system/user",
        name: "systemUser",
        component: () => import("/@/views/system/user/index.vue"),

        meta: {
          title: "用户管理"
        }
      },
      {
        path: "/system/group",
        name: "systemGroup",
        component: () => import("/@/views/system/group/index.vue"),

        meta: {
          title: "分组管理"
        }
      }
    ]
  }
];

export default showRouter;
