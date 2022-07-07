<template>
  <div class="fs-login">
    <el-dialog v-model="dialogVisible" width="30%" :title="title" destroy-on-close>
      <div class="scan-qrCode">
        <div id="fsLogin" />
        <span>使用飞书扫码{{ title }}</span>
      </div>
    </el-dialog>
    <Motion>
      <el-tooltip effect="dark" :content="'飞书扫码' + title" placement="left">
        <el-icon class="hover-icon" :size="40" style="margin-right: 30px">
          <AntDesignQrcodeOutlined @click="scan" />
        </el-icon>
      </el-tooltip>

      <el-tooltip effect="dark" :content="'飞书web' + title" placement="right">
        <el-image class="hover-icon" :src="FsLogin" :size="40" @click="open" style="width: 40px; height: 40px" />
      </el-tooltip>
    </Motion>
  </div>
</template>

<script lang="ts" setup>
import FsLogin from "/@/assets/login/fsLogin.png";
import AntDesignQrcodeOutlined from "~icons/ant-design/qrcode-outlined";
import { nextTick, ref } from "vue";
import { QRCode } from "/@/plugins/fs-QRCode";
import { useUserStore } from "/@/store/modules/user";
import Motion from "/@/utils/motion";
QRCode();

const props = defineProps({
  title: { type: String, required: true },
  callbackFunc: { type: String, required: true }
});

const state = useUserStore().$state.token;
const client_id = "cli_a23bce10d9f81013"; // 飞书的client_id
const redirect_uri = window.location.origin + "/api/" + props.callbackFunc; // 回调地址
const goto = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${state}`;

const dialogVisible = ref(false);
const scan = async () => {
  dialogVisible.value = true;
  await nextTick();
  // @ts-ignore
  const QRLoginObj = window.QRLogin({
    id: "fsLogin",
    goto: goto,
    width: "300",
    height: "300"
    // style: "width:300px;height:300px" // 可选的，二维码html标签的style属性
  });

  const handleMessage = function (event) {
    const origin = event.origin;
    // 使用 matchOrigin 方法来判断 message 来自页面的url是否合法
    if (QRLoginObj.matchOrigin(origin)) {
      const loginTmpCode = event.data;
      window.location.href = `${goto}&tmp_code=${loginTmpCode}`;
    }
  };
  if (typeof window.addEventListener !== "undefined") {
    window.addEventListener("message", handleMessage, false);
    // @ts-ignore
  } else if (typeof window.attachEvent !== "undefined") {
    // @ts-ignore
    window.attachEvent("onmessage", handleMessage);
  }
};

const open = () => {
  window.open(goto, "_self");
};
</script>

<style lang="scss" scoped>
.fs-login {
  display: inline-block;

  .scan-qrCode {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    ::v-deep(iframe) {
      border: 0;
    }
  }
}

.hover-icon {
  cursor: pointer;

  &:hover {
    background: #a0cfff;
  }
}
</style>
