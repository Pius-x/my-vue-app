<template>
  <div class="search-footer">
    <span class="search-footer-item">
      <enter-outlined style="width: 20px; height: 20px" class="icon" />
      确认
    </span>
    <span class="search-footer-item">
      <arrow-up-line class="icon" style="width: 20px; height: 20px" />
      <arrow-down-line class="icon" style="width: 20px; height: 20px" />
      切换
    </span>
    <span class="search-footer-item">
      <keyboard-esc class="icon" style="width: 20px; height: 20px" />
      关闭
    </span>
  </div>
</template>

<script lang="ts" setup>
import ArrowUpLine from "~icons/ri/arrow-up-line";
import ArrowDownLine from "~icons/ri/arrow-down-line";
import EnterOutlined from "~icons/ant-design/enter-outlined";
import KeyboardEsc from "~icons/mdi/keyboard-esc";
</script>
<style lang="scss" scoped>
.search-footer {
  display: flex;
  color: #333;

  .search-footer-item {
    display: flex;
    align-items: center;
    margin-right: 14px;
  }

  .icon {
    padding: 2px;
    margin-right: 3px;
    font-size: 20px;
    box-shadow: inset 0 -2px #cdcde6, inset 0 0 1px 1px #fff, 0 1px 2px 1px #1e235a66;
  }
}
</style>
