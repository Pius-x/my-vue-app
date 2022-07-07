export function QRCode() {
  return new Promise(function (resolve, reject) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://sf3-cn.feishucdn.com/obj/feishu-static/lark/passport/qrcode/LarkSSOSDKWebQRCode-1.0.2.js";
    script.onerror = reject;
    document.body.appendChild(script);
    script.onload = () => {
      // @ts-ignore
      resolve(window.QRLogin);
    };
  });
}
