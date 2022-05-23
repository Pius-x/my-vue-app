<script setup lang="ts">
import { useRouter } from "vue-router";
import { initRouter } from "/@/router/utils";
import bg from "/@/assets/login/bg.png";
import LogosVue from "~icons/logos/vue";
import Illustration from "/@/assets/login/illustration.svg?component";
import { isEmpty } from "/@/utils/is";
import { showMessage } from "/@/utils/message";
import RiUser from "~icons/ri/user-3-fill";
import RiLock from "~icons/ri/lock-fill";
import { HttpResponse } from "/@/utils/http/types";
import { setToken } from "/@/utils/auth";

const router = useRouter();

let user = ref("");
let pwd = ref("");

const onLogin = (): void => {
  //用户名判空
  if (isEmpty(user.value)) {
    showMessage("用户名不能为空！", "error");
    return;
  }
  //密码判空
  if (isEmpty(pwd.value)) {
    showMessage("密码不能为空！", "error");
    return;
  }

  //发起请求
  http
    .post("base/login", { userName: user.value, password: pwd.value }, false)
    .then((data: HttpResponse) => {
      //设置Token
      setToken(data.data);

      //登录的时候初始化路由
      initRouter().then(() => {});
      router.push("/");
    })
    .catch(error => {
      return error;
    });
};

const pwdColor = ref("color: #999"); //#999
const userColor = ref("color: #999"); //#999

function onPwdFocus() {
  pwdColor.value = "color: #5392f0";
}

function onPwdBlur() {
  pwdColor.value = "color: #999";
}

function onUserFocus() {
  userColor.value = "color: #5392f0";
}

function onUserBlur() {
  userColor.value = "color: #999";
}
</script>

<template>
  <el-image :src="bg" class="wave" />
  <div class="login-container">
    <div class="img">
      <illustration />
    </div>
    <div class="login-box">
      <div class="login-form">
        <logos-vue class="avatar" />
        <h2>Super Fox GM</h2>
        <el-input
          @focus="onUserFocus"
          @blur="onUserBlur"
          v-model="user"
          size="large"
          class="input_login w-50 m-2"
          placeholder="输入账户名或者手机号码"
        >
          <template #prefix>
            <ri-user :style="userColor" />
          </template>
        </el-input>
        <el-input
          @focus="onPwdFocus"
          @blur="onPwdBlur"
          type="password"
          show-password
          v-model="pwd"
          size="large"
          class="input_login w-4 m-2"
          placeholder="输入密码"
          @keydown.enter="onLogin"
        >
          <template #prefix>
            <ri-lock :style="pwdColor" />
          </template>
        </el-input>

        <el-button class="btn" @click="onLogin">登录</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("../style/login.css");
</style>
