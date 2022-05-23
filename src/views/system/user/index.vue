<template>
  <div>
    <el-card>
      <el-row style="margin-bottom: 10px" justify="start">
        <el-button :icon="EpPlus" type="primary" @click="addUser"> 新增用户 </el-button>
      </el-row>

      <el-table stripe border :data="dataList" :header-cell-style="{ background: '#f4f4f5', color: '#606266' }">
        <el-table-column label="用户ID" align="center" prop="id" width="120" />
        <el-table-column label="账号名" align="center" prop="account" />
        <el-table-column label="用户昵称" align="center" prop="name" />
        <el-table-column label="所属分组" align="center" prop="gid" :filters="GroupFilterArr" :filter-method="filterGroup">
          <template #default="{ row }">
            <el-tag>{{ GroupMap.get(row.gid) }}</el-tag>
          </template>
        </el-table-column>
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
            <el-link type="primary" @click="editUser(scope.row)" :icon="EpEditPen">
              <span class="icon-link-margin">修改</span>
            </el-link>
            <el-popconfirm title="是否确认删除用户?" @confirm="handleDelete(scope.row)">
              <template #reference>
                <el-link class="operate-margin" type="primary" :icon="EpDelete">
                  <span class="icon-link-margin">删除</span>
                </el-link>
              </template>
            </el-popconfirm>

            <el-popconfirm title="是否确认重置密码?" @confirm="handleRestPwd(scope.row)">
              <template #reference>
                <el-link class="operate-margin" type="primary" :icon="EpUnlock">
                  <span class="icon-link-margin">重置密码</span>
                </el-link>
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
          <el-cascader
            v-model.number="userInfoForm.gid"
            style="width: 100%"
            :options="AuthorityOption"
            :props="{ checkStrictly: true, label: 'gname', value: 'gid', disabled: 'disabled', emitPath: false }"
            :show-all-levels="false"
            filterable
          />
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
import EpUnlock from "~icons/ep/unlock";
import EpDelete from "~icons/ep/delete";
import EpEditPen from "~icons/ep/edit-pen";
import EpLoading from "~icons/ep/loading";
import EpSearch from "~icons/ep/search";
import EpPlus from "~icons/ep/plus";
import { Ref } from "vue";
import { HttpResponse } from "/@/utils/http/types";
import AntPagination from "/@/components/AntPagination/index.vue";
import { useUserStore } from "/@/store/modules/user";

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
  return http
    .get("user/getUserList", { page, pageSize, gid: useUserStore().gid, keyword: searchCondition.value })
    .then((data: HttpResponse) => {
      if (data.code === 0) {
        const { list, total: totalNum } = data.data;
        dataList.value = list;
        total.value = totalNum;
      }
    });
}

const filterGroup = (value: string, row) => {
  return row.gid === value;
};

const GroupMap: Ref<Map<number, string>> = ref(new Map([[0, "根分组"]]));
const GroupFilterArr: Ref<{ text: string; value: number }[]> = ref([]);
const AuthorityOption = ref([]);

const setOptions = async () => {
  await http.get("group/getGroupList", { gid: useUserStore().gid }).then((data: HttpResponse) => {
    if (data.code === 0) {
      const { list } = data.data;
      if (useUserStore().gid === 0) {
        AuthorityOption.value.push({ gid: 0, gname: "根分组" });
      }
      setAuthorityOptions(list, AuthorityOption.value);
    }
  });
};
const setAuthorityOptions = (AuthorityData, optionsData) => {
  AuthorityData &&
    AuthorityData.forEach(item => {
      if (item.children && item.children.length) {
        const option = {
          gid: item.gid,
          gname: item.gname,
          children: []
        };
        setAuthorityOptions(item.children, option.children);
        optionsData.push(option);
        GroupFilterArr.value.push({ text: item.gname, value: item.gid });
        GroupMap.value.set(item.gid, item.gname);
      } else {
        const option = {
          gid: item.gid,
          gname: item.gname
        };
        optionsData.push(option);
        GroupFilterArr.value.push({ text: item.gname, value: item.gid });
        GroupMap.value.set(item.gid, item.gname);
      }
    });
};

onMounted(() => {
  getUserList();
  setOptions();
});
</script>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.operate-margin {
  margin-left: 10px;
}

.icon-link-margin {
  margin-left: 4px;
}
</style>
