<script setup lang="ts">
import { useNav } from "../hooks/nav";
import Search from "./search/index.vue";
import DarkMode from "./darkMode/index.vue";
import Setting from "./setting/index.vue";
import Hamburger from "./sidebar/hamBurger.vue";
import Breadcrumb from "./sidebar/breadCrumb.vue";
import { deviceDetection } from "/@/utils/deviceDetection";
import Screenfull from "../components/screenfull/index.vue";

const { toggleSideBar, pureApp } = useNav();
</script>

<template>
  <div class="navbar">
    <Hamburger :is-active="pureApp.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <Breadcrumb class="breadcrumb-container" />
    <div class="vertical-header-right">
      <!-- 菜单搜索 -->
      <Search />
      <!-- 暗黑模式 -->
      <DarkMode />
      <!-- 全屏 -->
      <screenfull id="header-screenfull" v-show="!deviceDetection()" />
      <!-- 设置 -->
      <setting />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 48px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;
  }

  .vertical-header-right {
    display: flex;
    min-width: 280px;
    height: 48px;
    align-items: center;
    color: #000000d9;
    justify-content: flex-end;

    :deep(.dropdown-badge) {
      &:hover {
        background: #f6f6f6;
      }
    }

    .screen-full {
      cursor: pointer;

      &:hover {
        background: #f6f6f6;
      }
    }
  }

  .breadcrumb-container {
    float: left;
  }
}
</style>
