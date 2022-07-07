<script setup lang="ts">
import home from "/@/assets/home/home.svg?component";
import { useUserStore } from "/@/store/modules/user";
import { useNav } from "/@/layout/hooks/nav";
import Motion from "/@/utils/motion";
const { username } = useNav();
const { lastLoginTime } = useUserStore();
</script>

<template>
  <el-card>
    <div style="text-align: center">
      <Motion :delay="200">
        <h2 style="font-size: 25px; margin-bottom: 20px">
          <strong>欢迎登录!&nbsp;&nbsp; </strong>
          <strong style="color: #606266">{{ username }}</strong>
          <strong style="font-size: 22px"> ，&nbsp;&nbsp;上次登录时间： </strong>
          <strong style="font-size: 18px; color: #606266">{{ lastLoginTime }}</strong>
        </h2>
      </Motion>

      <Motion :delay="100">
        <component :is="home" style="display: block; margin: auto" />
      </Motion>
    </div>
  </el-card>
</template>
