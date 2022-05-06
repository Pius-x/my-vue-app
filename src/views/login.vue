<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { initRouter } from "/@/router/utils";
import { addClass, removeClass } from "/@/utils/operate";
import bg from "/@/assets/login/bg.png";
import Avatar from "/@/assets/login/avatar.svg?component";
import Illustration from "/@/assets/login/illustration.svg?component";
import { useUserStoreHook } from "/@/store/modules/user";
import { isEmpty } from "/@/utils/is";
import { showMessage } from "/@/utils/message";
import RiUser from "~icons/ri/user-3-fill";
import RiLock from "~icons/ri/lock-fill";

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

  useUserStoreHook()
    .loginByUsername({ userName: user.value, password: pwd.value })
    .then(() => {
      //登录的时候初始化路由
      initRouter().then(() => {});
      router.push("/");
    })
    .catch(() => {
      return;
    });
};

function onUserFocus() {
  addClass(document.querySelector(".user"), "focus");
}

function onUserBlur() {
  if (user.value.length === 0) removeClass(document.querySelector(".user"), "focus");
}

function onPwdFocus() {
  addClass(document.querySelector(".pwd"), "focus");
}

function onPwdBlur() {
  if (pwd.value.length === 0) removeClass(document.querySelector(".pwd"), "focus");
}
</script>

<template>
  <img :src="bg" class="wave" />
  <div class="login-container">
    <div class="img">
      <illustration />
    </div>
    <div class="login-box">
      <div class="login-form">
        <avatar class="avatar" />
        <h2
          v-motion
          :initial="{
            opacity: 0,
            y: 100
          }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: 100
            }
          }"
        >
          Super Fox GM
        </h2>
        <div
          class="input-group user focus"
          v-motion
          :initial="{
            opacity: 0,
            y: 100
          }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: 200
            }
          }"
        >
          <div class="icon">
            <ri-user style="height: 14px; width: 14px" />
          </div>
          <div>
            <h5>用户名</h5>
            <input type="text" class="input" v-model="user" @focus="onUserFocus" @blur="onUserBlur" />
          </div>
        </div>
        <div
          class="input-group pwd focus"
          v-motion
          :initial="{
            opacity: 0,
            y: 100
          }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: 300
            }
          }"
        >
          <div class="icon">
            <ri-lock style="width: 14px; height: 14px" />
          </div>
          <div>
            <h5>密码</h5>
            <input type="password" class="input" v-model="pwd" @focus="onPwdFocus" @blur="onPwdBlur" @keydown.enter="onLogin" />
          </div>
        </div>
        <button
          class="btn"
          v-motion
          :initial="{
            opacity: 0,
            y: 10
          }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: 400
            }
          }"
          @click="onLogin"
        >
          登录
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("/@/style/login.css");
</style>
