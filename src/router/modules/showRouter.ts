import { RouteRecordRaw } from "vue-router";
import EpHomeFilled from "~icons/ep/home-filled";
import MaterialSymbolsPerson from "~icons/material-symbols/person";
import MaterialSymbolsGroup from "~icons/material-symbols/group";
import CarbonOperationsRecord from "~icons/carbon/operations-record";
import EpLollipop from "~icons/ep/lollipop";
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
      title: "HOME",
      rank: 0
    },
    children: [
      {
        path: "/welcome",
        name: "welcome",
        component: () => import("/@/views/welcome.vue"),
        meta: {
          icon: shallowRef(EpHomeFilled),
          title: "首页"
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
          icon: shallowRef(MaterialSymbolsPerson),
          title: "用户管理"
        }
      },
      {
        path: "/system/group",
        name: "systemGroup",
        component: () => import("/@/views/system/group/index.vue"),

        meta: {
          icon: shallowRef(MaterialSymbolsGroup),
          title: "分组管理"
        }
      },
      {
        path: "/system/operationRecords",
        name: "systemOperationRecords",
        component: () => import("/@/views/system/operationRecords/index.vue"),

        meta: {
          icon: shallowRef(CarbonOperationsRecord),
          title: "操作记录"
        }
      }
    ]
  }
];

export default showRouter;
