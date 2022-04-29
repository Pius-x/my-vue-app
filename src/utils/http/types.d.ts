import { Method, AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";

export type resultType = {
  accessToken?: string;
};
export interface HttpResponse extends Promise<any> {
  code: number; //错误码
  data?: object | any[]; //返回的数据
  msg?: string; //附带信息
}

export type RequestMethods = Extract<Method, "get" | "post" | "put" | "delete" | "patch" | "option" | "head">;

export interface PureHttpError extends AxiosError {
  isCancelRequest?: boolean;
}

export interface PureHttpResponse extends AxiosResponse {
  config: PureHttpRequestConfig;
}

export interface PureHttpRequestConfig extends AxiosRequestConfig {
  beforeRequestCallback?: (request: PureHttpRequestConfig) => void;
  beforeResponseCallback?: (response: PureHttpResponse) => void;
}

export default class PureHttp {
  request<T>(method: RequestMethods, url: string, param?: AxiosRequestConfig, axiosConfig?: PureHttpRequestConfig): Promise<T>;
  post<T, P>(url: string, params?: T, config?: PureHttpRequestConfig): Promise<P>;
  get<T, P>(url: string, params?: T, config?: PureHttpRequestConfig): Promise<P>;
}
