import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { HttpResponse, PureHttpError, RequestMethods, PureHttpResponse, PureHttpRequestConfig } from "./types.d";
import qs from "qs";
import NProgress from "../progress";
import { loadEnv } from "@build/index";
import { showMessage } from "/@/utils/message";
import { useUserStore } from "/@/store/modules/user";
import { ElMessageBox } from "element-plus";
import { getCurEnv } from "/@/utils/func";
import { hasPermissions } from "/@/router/utils";

// 加载环境变量 VITE_PROXY_DOMAIN（开发环境）  VITE_PROXY_DOMAIN_REAL（打包后的线上环境）
const { VITE_PROXY_DOMAIN, VITE_PROXY_DOMAIN_REAL } = loadEnv();

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  baseURL: process.env.NODE_ENV === "production" ? VITE_PROXY_DOMAIN_REAL : VITE_PROXY_DOMAIN,
  // 当前使用mock模拟请求，将baseURL置空
  // baseURL: "",
  timeout: 10000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  // 数组格式参数序列化
  paramsSerializer: params => qs.stringify(params, { indices: false })
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }
  // 初始化配置对象
  private static initConfig: PureHttpRequestConfig = {};

  // 保存当前Axios实例对象
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  // 请求拦截
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      // 在请求发送前做些什么
      (config: PureHttpRequestConfig) => {
        const $config = config;
        // 开启进度条动画
        NProgress.start();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback($config);
          return $config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback($config);
          return $config;
        }

        const userInfo = useUserStore().$state;
        if (userInfo.token) {
          //判断token是否过期 过期就重登陆
          const now = new Date().getTime();
          if (parseInt(userInfo.expiresAt) - now <= 0) {
            useUserStore().clearTokenCache();
          } else {
            config.headers["X-token"] = userInfo.token;
            config.headers["X-account"] = userInfo.account;
          }
        }

        return $config;
      },
      // 在请求错误时做些什么
      error => {
        return Promise.reject(error);
      }
    );
  }

  // 响应拦截
  private httpInterceptorsResponse(): void {
    PureHttp.axiosInstance.interceptors.response.use(
      // 在收到响应时做些什么
      (response: PureHttpResponse) => {
        const $config = response.config;
        const $data: HttpResponse = response.data;
        // 关闭进度条动画
        NProgress.done();

        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return $data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return $data;
        }

        // 弹出错误码消息 异常请求都弹 Post请求弹消息
        const msgType = $data.code === 0 ? "success" : "warning";
        if (msgType !== "success" || $config.method === "post") {
          showMessage($data.msg, msgType);
        }
        return $data;
      },
      //在响应错误时做些什么
      (error: PureHttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // 关闭进度条动画
        NProgress.done();
        showMessage(`${$error.name}：${$error.message}`, "error");
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject($error);
      }
    );
  }

  // 通用请求工具函数
  public request<T>(method: RequestMethods, url: string, param?: AxiosRequestConfig, axiosConfig?: PureHttpRequestConfig): Promise<T> {
    const config = { method, url, ...param, ...axiosConfig } as PureHttpRequestConfig;

    // 单独处理自定义请求/响应回调
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  // 单独抽离的post工具函数
  public post<T, P>(url: string, data?: T, reconfirm = true, config?: PureHttpRequestConfig): Promise<P> {
    return new Promise(resolve => {
      // 判断读写权限
      if (!hasPermissions()) {
        return;
      }

      if (!reconfirm) {
        return resolve(this.request<P>("post", url, { data }, config));
      }

      ElMessageBox.confirm(`<strong>当前环境为：</strong><strong style="color: red">${getCurEnv()}</strong><br>是否继续操作?`, "系统提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        center: true
      })
        .then(() => {
          resolve(this.request<P>("post", url, { data }, config));
        })
        .catch(() => {
          showMessage("已取消操作", "warning");
        });
    });
  }

  // 单独抽离的get工具函数
  public get<T, P>(url: string, params?: T, config?: PureHttpRequestConfig): Promise<P> {
    return this.request<P>("get", url, { params }, config);
  }
}

export const http = new PureHttp();
