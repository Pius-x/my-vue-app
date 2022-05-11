<template>
  <div>
    <el-card>
      <el-row style="margin-bottom: 10px" justify="start">
        <el-button :icon="EpPlus" type="primary" @click="addUser"> 新增用户 </el-button>
      </el-row>

      <el-table border :data="dataList" :header-cell-style="{ background: '#fafafa', color: '#606266' }">
        <el-table-column label="用户ID" align="center" prop="id" width="120" />
        <el-table-column label="账号名" align="center" prop="account" />
        <el-table-column label="用户昵称" align="center" prop="name" />
        <el-table-column label="分组" align="center" prop="gid" />
        <el-table-column label="手机号码" align="center" prop="mobile" />
        <el-table-column label="创建时间" align="center" width="180" prop="create_time" />
        <el-table-column label="创建人" align="center" prop="create_by" />
        <el-table-column fixed="right" label="操作" width="240" align="center">
          <template #header>
            <el-input
              :prefix-icon="loading ? EpLoading : EpSearch"
              :loading="loading"
              v-model="searchCondition"
              placeholder="输入账号名或手机号码搜索"
              @keydown.enter="getUserList"
            />
          </template>
          <template #default="scope">
            <el-button class="reset-margin" type="text" @click="editUser(scope.row)" :icon="EpEditPen"> 修改 </el-button>
            <el-popconfirm title="是否确认删除用户?" @confirm="handleDelete(scope.row)">
              <template #reference>
                <el-button class="reset-margin" type="text" :icon="EpDelete"> 删除 </el-button>
              </template>
            </el-popconfirm>

            <el-popconfirm title="是否确认重置密码?" @confirm="handleRestPwd(scope.row)">
              <template #reference>
                <el-button class="reset-margin" type="text" :icon="EpLock"> 重置密码 </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <ant-pagination v-model="pagination" :total="total" />
    </el-card>

    <!--    用户信息修改弹窗-->
    <el-dialog v-model="userInfoDialogVisible" title="用户信息修改" width="30%" destroy-on-close center>
      <el-form ref="ruleFormRef" :model="userInfoForm" status-icon :rules="userInfoRules" label-width="120px">
        <el-form-item label="用户ID" prop="id">
          <el-input disabled v-model="userInfoForm.id" placeholder="新增用户时自动填写ID" />
        </el-form-item>
        <el-form-item label="账户名" prop="account">
          <el-input :disabled="accountDisable === 'edit'" v-model="userInfoForm.account" />
        </el-form-item>
        <el-form-item />

        <el-form-item label="用户昵称" prop="name">
          <el-input v-model="userInfoForm.name" />
        </el-form-item>
        <el-form-item label="分组" prop="gid">
          <el-input-number v-model="userInfoForm.gid" controls-position="right" />
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="userInfoForm.mobile" />
        </el-form-item>
        <el-form-item v-if="accountDisable === 'add'" label="密码">
          <el-input disabled placeholder="初始密码为：123456" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userInfoDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdate">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: "user"
};
</script>

<script setup lang="ts">
import EpLock from "~icons/ep/lock";
import EpDelete from "~icons/ep/delete";
import EpEditPen from "~icons/ep/edit-pen";
import EpLoading from "~icons/ep/loading";
import EpSearch from "~icons/ep/search";
import EpPlus from "~icons/ep/plus";
import { ref, onMounted, reactive, watch } from "vue";
import { http } from "/@/utils/http";
import { HttpResponse } from "/@/utils/http/types";
import AntPagination from "/@/components/AntPagination/index.vue";

let searchCondition = ref("");
let userInfoDialogVisible = ref(false);
let dataList = ref([]);
let loading = ref(false);
let accountDisable = ref("");
let total = ref(0);

let pagination = ref({
  pageSize: 10,
  currentPage: 1
});

watch(pagination.value, x => {
  getUserList();
});

let userInfoForm = ref({
  id: "",
  account: "",
  gid: 0,
  name: "",
  mobile: ""
});

const userInfoRules = reactive({
  account: [{ required: true, trigger: "blur" }],
  gid: [{ required: true, trigger: "blur" }],
  name: [{ required: true, trigger: "blur" }],
  mobile: [{ required: true, trigger: "blur" }]
});

function addUser() {
  accountDisable.value = "add";
  userInfoForm.value = {
    id: "",
    account: "",
    gid: 0,
    name: "",
    mobile: ""
  };
  userInfoDialogVisible.value = true;
}

function editUser(row) {
  accountDisable.value = "edit";
  let { id, account, gid, name, mobile } = row;
  userInfoForm.value = { id, account, gid, name, mobile };

  userInfoDialogVisible.value = true;
}

async function handleUpdate() {
  switch (accountDisable.value) {
    case "add":
      await createUserInfo();
      break;
    case "edit":
      await updateUserInfo();
      break;
  }
  await getUserList();
}

function createUserInfo() {
  return http.post("user/createUserInfo", userInfoForm.value).then((data: HttpResponse) => {
    if (data.code === 0) {
      userInfoDialogVisible.value = false;
    }
  });
}

function updateUserInfo() {
  return http.post("user/updateUserInfo", userInfoForm.value).then((data: HttpResponse) => {
    if (data.code === 0) {
      userInfoDialogVisible.value = false;
    }
  });
}

function handleDelete(row) {
  const id = row.id;
  http.post("user/deleteUser", { id }).then((data: HttpResponse) => {
    if (data.code === 0) {
      getUserList();
    }
  });
}

function handleRestPwd(row) {
  const id = row.id;
  http.post("user/resetPassword", { id });
}

function getUserList() {
  const { currentPage: page, pageSize } = pagination.value;
  return http.get("user/getUserList", { page, pageSize, keyword: searchCondition.value }).then((data: HttpResponse) => {
    if (data.code === 0) {
      const { list, total: totalNum } = data.data;
      dataList.value = list;
      total.value = totalNum;
    }
  });
}

onMounted(() => {
  getUserList();
});
</script>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
