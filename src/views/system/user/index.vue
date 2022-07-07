<template>
  <div>
    <el-card>
      <el-row justify="space-between" align="bottom">
        <el-button v-if="isSuperGroup" :icon="EpPlus" type="primary" @click="addUser"> 新增用户 </el-button>
        <el-tag type="warning">只展示你所在分组的下级分组用户列表</el-tag>
      </el-row>
      <hr style="margin: 10px 0" />
      <el-table v-loading="loading" stripe border :data="dataList" :header-cell-style="{ background: '#f4f4f5', color: '#606266' }">
        <el-table-column label="用户ID" align="center" prop="id" width="120" />
        <el-table-column label="账号名" align="center" prop="account" />
        <el-table-column label="用户昵称" align="center" prop="name" />
        <el-table-column label="所属分组" align="center" prop="gid">
          <template #header>
            <span :style="{ color: isEmpty(gidCheckList) ? '' : '#409eff' }">所属分组</span>
            <el-popover placement="bottom" width="auto" trigger="click">
              <template #reference>
                <el-icon style="margin-left: 5px" class="cursor-pointer">
                  <EpLoading v-if="loading" />
                  <EpFilter v-else />
                </el-icon>
              </template>
              <div>
                <el-row style="margin-top: 10px" justify="space-between" align="bottom">
                  <el-link style="margin-left: 20%" type="warning" @click="onResetFilter"> 重置 </el-link>
                  <el-link style="margin-right: 20%" type="primary" @click="onFilter"> 过滤 </el-link>
                </el-row>
                <hr style="margin: 5px 0" />
                <el-tree
                  style="margin-right: 25px"
                  ref="menuTree"
                  :data="AuthorityOption"
                  :default-checked-keys="menuTreeIds"
                  :props="menuDefaultProps"
                  @check-change="checkChange()"
                  default-expand-all
                  :check-on-click-node="true"
                  :check-strictly="true"
                  :expand-on-click-node="false"
                  highlight-current
                  node-key="gid"
                  show-checkbox
                />
              </div>
            </el-popover>
          </template>
          <template #default="{ row }">
            <el-tag :type="row.gid === -1 ? 'warning' : ''">{{ GroupMap.get(row.gid) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="手机号码" align="center" prop="mobile" />
        <el-table-column label="飞书关联" align="center" prop="bind_fs">
          <template #default="{ row }">
            <el-tag :type="row.bind_fs ? 'success' : ''">{{ row.bind_fs ? "已关联" : "未关联" }}</el-tag>
          </template>
        </el-table-column>
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
          <template #default="{ row }">
            <div v-if="isSuperGroup">
              <el-link :disabled="row.id === operatorId" type="primary" @click="editUser(row)" :icon="EpEditPen">
                <span class="icon-link-margin">修改</span>
              </el-link>
              <el-popconfirm :disabled="row.id === operatorId" title="是否确认删除用户?" @confirm="handleDelete(row.id)">
                <template #reference>
                  <el-link :disabled="row.id === operatorId" class="operate-margin" type="primary" :icon="EpDelete">
                    <span class="icon-link-margin">删除</span>
                  </el-link>
                </template>
              </el-popconfirm>

              <el-popconfirm title="是否确认重置密码?" @confirm="handleRestPwd(row.id)">
                <template #reference>
                  <el-link class="operate-margin" type="primary" :icon="EpUnlock">
                    <span class="icon-link-margin">重置密码</span>
                  </el-link>
                </template>
              </el-popconfirm>

              <el-popconfirm :disabled="!row.bind_fs" title="是否确认解除飞书关联?" @confirm="handleUnBindFs(row.id)">
                <template #reference>
                  <el-link :disabled="!row.bind_fs" class="operate-margin" type="primary" :icon="CiUnlink">
                    <span class="icon-link-margin">解除飞书关联</span>
                  </el-link>
                </template>
              </el-popconfirm>
            </div>
            <div v-else>
              <el-link :disabled="row.id === operatorId || row.gid !== -1" type="primary" @click="editUser(row)" :icon="EpKey">
                <span class="icon-link-margin">分配分组</span>
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <ant-pagination v-model="pagination" :total="total" />
    </el-card>

    <!--    用户信息修改弹窗-->
    <el-dialog v-model="userInfoDialogVisible" :title="(isEditing ? '更新' : '新建') + '用户信息'" width="30%" destroy-on-close center>
      <el-form ref="ruleFormRef" :model="userInfoForm" status-icon :rules="userInfoRules" label-width="120px">
        <el-form-item label="用户ID" prop="id">
          <el-input disabled v-model="userInfoForm.id" placeholder="新增用户时自动填写ID" />
        </el-form-item>
        <el-form-item label="账号名" prop="account">
          <el-input :disabled="isEditing" v-model="userInfoForm.account" placeholder="请填写账号名(唯一)" />
        </el-form-item>
        <el-form-item />

        <el-form-item label="用户姓名" prop="name">
          <el-input :disabled="!isSuperGroup" v-model="userInfoForm.name" placeholder="请填写用户姓名" />
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
          <el-input :disabled="!isSuperGroup" v-model="userInfoForm.mobile" placeholder="请填写手机号码(唯一)" />
        </el-form-item>
        <el-form-item v-if="!isEditing" label="密码">
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

<script setup lang="ts" name="User">
import EpUnlock from "~icons/ep/unlock";
import CiUnlink from "~icons/ci/unlink";
import EpDelete from "~icons/ep/delete";
import EpEditPen from "~icons/ep/edit-pen";
import EpLoading from "~icons/ep/loading";
import EpSearch from "~icons/ep/search";
import EpPlus from "~icons/ep/plus";
import EpFilter from "~icons/ep/filter";
import EpKey from "~icons/ep/key";

import { Ref } from "vue";
import { isEmpty } from "/@/utils/is";
import { HttpResponse } from "/@/utils/http/types";
import AntPagination from "/@/components/AntPagination/index.vue";
import { useUserStore } from "/@/store/modules/user";
import { showMessage } from "/@/utils/message";

let userInfoDialogVisible = ref(false);
let loading = ref(false);
let total: Ref<number> = ref(0);

const { id: operatorId, gid: operatorGid, isSuperGroup, isRootUser } = useUserStore();

const menuDefaultProps = ref({
  children: "children",
  label: "gname"
});

const menuTreeIds = ref([]);
const menuTree = ref(null); // 关联树 确认方法

let pagination = ref({
  pageSize: 10,
  currentPage: 1
});

watch(pagination.value, () => {
  getUserList();
});

let userInfoForm = ref({
  id: "",
  account: "",
  gid: -1,
  name: "",
  mobile: "",
  bindFs: false
});

const userInfoRules = reactive({
  account: [{ required: true, trigger: "blur" }],
  gid: [{ required: true, trigger: "blur" }],
  name: [{ required: true, trigger: "blur" }],
  mobile: [{ required: true, trigger: "blur" }]
});

let isEditing = ref(false);

function addUser() {
  isEditing.value = false;
  userInfoForm.value = {
    id: "",
    account: "",
    gid: -1,
    name: "",
    mobile: "",
    bindFs: false
  };
  userInfoDialogVisible.value = true;
}

function editUser(row) {
  isEditing.value = true;
  let { id, account, gid, name, mobile, bind_fs: bindFs } = row;
  userInfoForm.value = { id, account, gid, name, mobile, bindFs };

  userInfoDialogVisible.value = true;
}

async function handleUpdate() {
  if (isEditing.value) {
    await updateUserInfo();
  } else {
    await createUserInfo();
  }

  await getUserList();
}

function createUserInfo() {
  // 非根分组下的用户不能创建Gid为0的用户
  if (userInfoForm.value.gid == 0 && !isSuperGroup) {
    showMessage("分组不能为空", "warning");
    return;
  }

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

function handleDelete(id) {
  http.post("user/deleteUser", { id }).then((data: HttpResponse) => {
    if (data.code === 0) {
      getUserList();
    }
  });
}

function handleRestPwd(id) {
  http.post("user/resetPassword", { id });
}

function handleUnBindFs(id) {
  http.post("user/unBindFs", { id });
}

let dataList = ref([]);
let searchCondition = ref("");

function getUserList() {
  loading.value = true;
  const { currentPage: page, pageSize } = pagination.value;
  return http
    .get("user/getUserList", { page, pageSize, gid: operatorGid, keyword: searchCondition.value, filter_gid_list: gidCheckList.value })
    .then((data: HttpResponse) => {
      if (data.code === 0) {
        const { list, total: totalNum } = data.data;
        dataList.value = list;
        total.value = totalNum;
      }
      loading.value = false;
    });
}

let gidCheckList = ref([]);

function checkChange() {
  gidCheckList.value = [...menuTree.value.getCheckedKeys()];
}
function onFilter() {
  getUserList();
}
function onResetFilter() {
  menuTree.value.setCheckedKeys([]);
  gidCheckList.value = [];
  getUserList();
}

const GroupMap: Ref<Map<number, string>> = ref(
  new Map([
    [-1, "游客分组"],
    [0, "根分组"]
  ])
);
const GroupFilterArr: Ref<{ text: string; value: number }[]> = ref([]);
const AuthorityOption = ref([]);

const setOptions = async () => {
  await http.get("group/getGroupList", { gid: operatorGid }).then((data: HttpResponse) => {
    if (data.code === 0) {
      const { list } = data.data;
      AuthorityOption.value.push({ gid: -1, gname: "游客分组" });
      GroupFilterArr.value.push({ text: "游客分组", value: -1 });
      if (isRootUser) {
        AuthorityOption.value.push({ gid: 0, gname: "根分组" });
        GroupFilterArr.value.push({ text: "根分组", value: 0 });
      }

      setAuthorityOptions(list, AuthorityOption.value);
    }
  });
};
const setAuthorityOptions = (AuthorityData, optionsData) => {
  AuthorityData &&
    AuthorityData.forEach(item => {
      const option = {
        gid: item.gid,
        gname: item.gname,
        disabled: operatorGid === item.gid,
        children: []
      };
      if (item.children && item.children.length) {
        setAuthorityOptions(item.children, option.children);
        optionsData.push(option);
      } else {
        delete option.children;
        optionsData.push(option);
      }

      GroupFilterArr.value.push({ text: item.gname, value: item.gid });
      GroupMap.value.set(item.gid, item.gname);
    });
};

onMounted(() => {
  getUserList();
  setOptions();
});
</script>

<style lang="scss">
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
