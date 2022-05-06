import { RouteRecordRaw } from "vue-router";
const Layout = () => import("/@/layout/index.vue");

//可见的路由表（根据用户权限判断最终是否展示）
const showRouter: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: Layout,
    redirect: "/welcome",
    meta: {
      icon: import("~icons/ep/home-filled"),
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
      icon: import("~icons/ep/lollipop"),
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
  }
];

export default showRouter;
