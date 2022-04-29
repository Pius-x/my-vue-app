import { ElMessage } from "element-plus";

// 统一消息函数
export const showMessage = (message: string, type: "success" | "warning" | "info" | "error", showClose = false): any => {
  message = message.length === 0 ? "发生未知错误！" : message;
  return ElMessage({
    showClose,
    message,
    type
  });
};
