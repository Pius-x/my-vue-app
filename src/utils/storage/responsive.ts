// 响应式storage
import { App } from "vue";
import Storage from "responsive-storage";

const nameSpace = "responsive-";

export const injectResponsiveStorage = (app: App, config: ServerConfigs) => {
  const configObj = {
    // 国际化 默认中文zh
    locale: Storage.getData("locale", nameSpace) ?? {
      locale: config.Locale ?? "zh"
    },
    // layout模式以及主题
    layout: Storage.getData("layout", nameSpace) ?? {
      layout: config.Layout ?? "vertical",
      theme: config.Theme ?? "default",
      darkMode: config.DarkMode ?? false,
      sidebarStatus: config.SidebarStatus ?? true,
      epThemeColor: config.EpThemeColor ?? "#409EFF"
    },
    configure: Storage.getData("configure", nameSpace) ?? {
      grey: config.Grey ?? false,
      weak: config.Weak ?? false,
      hideTabs: config.HideTabs ?? false,
      showLogo: config.ShowLogo ?? true,
      showModel: config.ShowModel ?? "smart"
    }
  };

  app.use(Storage, { nameSpace, memory: configObj });
};
