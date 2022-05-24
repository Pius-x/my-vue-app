import { RouteRecordRaw } from "vue-router";
const Layout = () => import("/@/layout/index.vue");

//隐藏的路由表（不展示在导航栏和标签列中）
const hideRouter: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "login",
    component: () => import("/@/views/login/index.vue"),
    meta: {
      title: "登陆",
      rank: 101
    }
  },
  {
    path: "/redirect",
    name: "redirect",
    component: Layout,
    meta: {
      icon: "home-filled",
      title: "首页",
      rank: 104
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "redirect",
        component: () => import("/@/layout/redirect.vue")
      }
    ]
  },
  {
    path: "/error",
    name: "error",
    component: Layout,
    redirect: "/error/403",
    meta: {
      icon: "information-line",
      title: "错误页面",
      rank: 9
    },
    children: [
      {
        path: "/error/403",
        name: "403",
        component: () => import("/@/views/error/403.vue"),
        meta: {
          title: "403"
        }
      },
      {
        path: "/error/404",
        name: "404",
        component: () => import("/@/views/error/404.vue"),
        meta: {
          title: "404"
        }
      },
      {
        path: "/error/500",
        name: "500",
        component: () => import("/@/views/error/500.vue"),
        meta: {
          title: "500"
        }
      }
    ]
  }
];

export default hideRouter;
