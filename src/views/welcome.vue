<script setup lang="ts">
import illustration2 from "/@/assets/home/home.svg?component";
</script>

<template>
  <el-card>
    <div style="text-align: center">
      <h2 style="font-size: 25px; margin-bottom: 20px"><strong>欢迎登录</strong></h2>
      <component :is="illustration2" style="display: block; margin: auto" />
    </div>
  </el-card>
</template>
