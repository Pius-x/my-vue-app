<script lang="ts" setup>
import { SearchModal } from "./components";
import useBoolean from "../../hooks/useBoolean";
import EpSearch from "~icons/ep/search";
const { bool: show, toggle } = useBoolean();
function handleSearch() {
  toggle();
}
</script>

<template>
  <div class="search-container" @click="handleSearch">
    <ep-search />
  </div>
  <SearchModal v-model:value="show" />
</template>

<style lang="scss" scoped>
.search-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  width: 60px;
  cursor: pointer;

  &:hover {
    background: #f6f6f6;
  }
}
</style>
