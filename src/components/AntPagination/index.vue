<template>
  <el-pagination
    class="flex justify-end mt-4"
    v-model:page-size="pageSize"
    v-model:current-page="currentPage"
    :page-sizes="pageSizes"
    :background="true"
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
  />
</template>

<script lang="ts">
export default {
  name: "AntPagination"
};
</script>
<script lang="ts" setup>
const props = defineProps({
  modelValue: { type: Object, required: true },
  total: { type: Number, required: true },
  pageSizes: {
    type: Array,
    default() {
      return [10, 20, 30, 50, 500];
    }
  }
});

const pagination = ref(props.modelValue);

const emits = defineEmits(["update:modelValue"]);

const pageSize = computed({
  get() {
    return props.modelValue.pageSize;
  },
  set(v: number) {
    const maxPageNum = Math.ceil(props.total / v);
    if (maxPageNum < currentPage.value) {
      currentPage.value = 1;
    }
    pagination.value.pageSize = v;
    emits("update:modelValue", pagination);
  }
});

const currentPage = computed({
  get() {
    return props.modelValue.currentPage;
  },
  set(v: number) {
    pagination.value.currentPage = v;
    emits("update:modelValue", pagination);
  }
});
</script>

<style scoped></style>
