<script lang="ts">
export default {
  name: "permissionPage"
};
</script>

<script setup lang="ts">
import { useRenderIcon } from "/@/components/ReIcon/src/hooks";

let purview = "";

function changRole() {}
</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>
          当前角色：
          <span style="font-size: 26px">{{ purview }}</span>
          <p style="color: #ffa500">查看左侧菜单变化(系统管理)，模拟后台根据不同角色返回对应路由</p></span
        >
      </div>
    </template>
    <el-button type="primary" @click="changRole" :icon="useRenderIcon('user', { color: '#fff' })">切换角色</el-button>
  </el-card>
</template>
