import { RouteLocationNormalized } from "vue-router";

export interface toRouteType extends RouteLocationNormalized {
  meta: {
    keepAlive?: boolean;
    refreshRedirect: string;
    dynamicLevel?: string;
  };
}

//路由记录
export interface RouterListRecordType {
  path: string;
  readonly: number;
}
