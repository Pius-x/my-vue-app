<script setup lang="ts">
import { find } from "lodash-unified";
import { getConfig } from "/@/config";
import { emitter } from "/@/utils/mitt";
import { themeColorsType } from "../../types";
import { useAppStoreHook } from "/@/store/modules/app";
import { shadeBgColor } from "../../theme/element-plus";
import { useEpThemeStoreHook } from "/@/store/modules/epTheme";
import { storageLocal } from "/@/utils/storage";
import { createNewStyle, writeNewStyle } from "../../theme/element-plus";
import { toggleTheme } from "@pureadmin/theme/dist/browser-utils";

import MaterialSymbolsDarkMode from "~icons/material-symbols/dark-mode?color=black";
import MaterialSymbolsWbSunny from "~icons/material-symbols/wb-sunny";

const body = document.documentElement as HTMLElement;
const instance = getCurrentInstance().appContext.app.config.globalProperties.$storage;
const instanceConfig = getCurrentInstance().appContext.app.config.globalProperties.$config;

let themeColors = ref<Array<themeColorsType>>([
  // 道奇蓝（默认）
  { color: "#1b2a47", themeColor: "default" },
  // 亮白色
  { color: "#ffffff", themeColor: "light" },
  // 猩红色
  { color: "#f5222d", themeColor: "dusk" },
  // 橙红色
  { color: "#fa541c", themeColor: "volcano" },
  // 金色
  { color: "#fadb14", themeColor: "yellow" },
  // 绿宝石
  { color: "#13c2c2", themeColor: "mingQing" },
  // 酸橙绿
  { color: "#52c41a", themeColor: "auroraGreen" },
  // 深粉色
  { color: "#eb2f96", themeColor: "pink" },
  // 深紫罗兰色
  { color: "#722ed1", themeColor: "saucePurple" }
]);

let layoutTheme =
  ref(storageLocal.getItem("responsive-layout")) ||
  ref({
    layout: instanceConfig?.Layout ?? "vertical",
    theme: instanceConfig?.Theme ?? "default"
  });

// body添加layout属性，作用于src/style/sidebar.scss
if (unref(layoutTheme)) {
  let layout = unref(layoutTheme).layout;
  let theme = unref(layoutTheme).theme;
  toggleTheme({
    scopeName: `layout-theme-${theme}`
  });
  setLayoutModel(layout);
}

const epThemeColor = ref(useEpThemeStoreHook().getEpThemeColor);

const settings = reactive({
  greyVal: instance.configure.grey,
  weakVal: instance.configure.weak,
  tabsVal: instance.configure.hideTabs,
  showLogo: instance.configure.showLogo,
  showModel: instance.configure.showModel,
  multiTagsCache: instance.configure.multiTagsCache
});

function storageConfigureChange<T>(key: string, val: T): void {
  const storageConfigure = instance.configure;
  storageConfigure[key] = val;
  instance.configure = storageConfigure;
}

const tagsChange = () => {
  let showVal = settings.tabsVal;
  storageConfigureChange("hideTabs", showVal);
  emitter.emit("tagViewsChange", showVal);
};

// 设置导航模式
function setLayoutModel(layout: string) {
  layoutTheme.value.layout = layout;
  window.document.body.setAttribute("layout", layout);
  instance.layout = {
    layout,
    theme: layoutTheme.value.theme,
    darkMode: instance.layout.darkMode,
    sidebarStatus: instance.layout.sidebarStatus,
    epThemeColor: instance.layout.epThemeColor
  };
  useAppStoreHook().setLayout(layout);
}

// 存放夜间主题切换前的导航主题色
let tempLayoutThemeColor;

// 设置导航主题色
function setLayoutThemeColor(theme: string) {
  tempLayoutThemeColor = instance.layout.theme;
  layoutTheme.value.theme = theme;
  toggleTheme({
    scopeName: `layout-theme-${theme}`
  });
  instance.layout = {
    layout: useAppStoreHook().layout,
    theme,
    darkMode: dataTheme.value,
    sidebarStatus: instance.layout.sidebarStatus,
    epThemeColor: instance.layout.epThemeColor
  };

  if (theme === "default" || theme === "light") {
    setEpThemeColor(getConfig().EpThemeColor);
  } else {
    const colors = find(themeColors.value, { themeColor: theme });
    setEpThemeColor(colors.color);
  }
}

// 设置ep主题色
const setEpThemeColor = (color: string) => {
  // @ts-expect-error
  writeNewStyle(createNewStyle(color));
  useEpThemeStoreHook().setEpThemeColor(color);
  body.style.setProperty("--el-color-primary-active", shadeBgColor(color));
};

let dataTheme = ref<boolean>(instance.layout.darkMode);

// 日间、夜间主题切换
function dataThemeChange() {
  if (dataTheme.value) {
    body.setAttribute("data-theme", "dark");
    setLayoutThemeColor("light");
  } else {
    body.setAttribute("data-theme", "");
    tempLayoutThemeColor && setLayoutThemeColor(tempLayoutThemeColor);
    instance.layout = {
      layout: useAppStoreHook().layout,
      theme: instance.layout.theme,
      darkMode: dataTheme.value,
      sidebarStatus: instance.layout.sidebarStatus,
      epThemeColor: instance.layout.epThemeColor
    };
  }
}

//初始化项目配置
nextTick(() => {
  settings.greyVal && document.querySelector("html")?.setAttribute("class", "html-grey");
  settings.weakVal && document.querySelector("html")?.setAttribute("class", "html-weakness");
  settings.tabsVal && tagsChange();
  // @ts-expect-error
  writeNewStyle(createNewStyle(epThemeColor.value));
  dataThemeChange();
});
</script>

<template>
  <el-switch
    title="暗黑模式"
    v-model="dataTheme"
    inline-prompt
    class="dark-mode"
    :active-icon="MaterialSymbolsWbSunny"
    :inactive-icon="MaterialSymbolsDarkMode"
    @change="dataThemeChange"
  />
</template>

<style lang="scss" scoped>
:deep(.el-divider__text) {
  font-size: 16px;
  font-weight: 700;
}

.dark-mode {
  width: 60px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  text-align: center;
}
</style>
