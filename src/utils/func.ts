import { loadEnv } from "@build/index";
import { routeMetaType } from "/@/layout/types";
import { getConfig } from "/@/config";

/**
 * 公共函数
 */
export function getCurEnv() {
  const mode = loadEnv().MODE;
  switch (mode) {
    case "development":
      return "开发环境";
    case "staging":
      return "预发布环境";
    case "production":
      return "线上环境";
    default:
      return getConfig().Title;
  }
}

// 动态title
export function changeTitle(meta: routeMetaType) {
  const Title = getCurEnv();
  document.title = Title ? `${meta.title} | ${Title}` : `${meta.title}`;
}
