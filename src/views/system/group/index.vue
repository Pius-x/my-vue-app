<template>
  <div>
    <el-card>
      <el-row justify="space-between" align="bottom">
        <el-button v-if="isSuperGroup" :icon="EpPlus" type="primary" @click="addAuthority(0)"> 新增分组 </el-button>
        <el-tag type="warning" class="">只展示当前权限下的分组列表</el-tag>
      </el-row>
      <hr style="margin: 10px 0" />
      <el-table
        border
        v-loading="loading"
        :default-expand-all="true"
        table-layout="auto"
        :header-cell-style="{ background: '#f4f4f5', color: '#606266' }"
        :data="tableData"
        :tree-props="{ children: 'children' }"
        :row-class-name="tableRowClassName"
        row-key="gid"
      >
        <el-table-column align="left" label="分组名" prop="gname" />
        <el-table-column align="center" label="用户列表" width="380">
          <template #default="{ row }">
            <el-button :disabled="operatorGid === row.gid" type="primary" icon="delete" size="small" text @click="openDrawerUserList(row)">
              点击查看用户列表
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="460">
          <template #default="{ row }">
            <el-button type="primary" :icon="EpSetting" size="small" text @click="openDrawerRouter(row)"> 设置权限 </el-button>
            <el-button type="primary" :icon="EpPlus" size="small" text @click="addAuthority(row.gid)">新增子分组</el-button>
            <el-button type="primary" :icon="EpEdit" size="small" text @click="editAuthority(row)">编辑</el-button>
            <el-button type="primary" :icon="EpDelete" size="small" text @click="deleteAuth(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 用户列表侧边栏 -->
    <el-drawer :with-header="false" v-if="drawerUserList" v-model="drawerUserList" size="40%" title="分组权限配置">
      <el-tabs class="role-box" type="border-card">
        <div>
          <el-button class="fl-right" type="primary" @click="multiUpdateUserGid">确 定</el-button>
          <el-divider />
        </div>
        <el-tab-pane :label="`【${curGroupName}】 用户列表`">
          <el-table
            v-loading="userDrawerLoading"
            stripe
            border
            :data="userListData"
            :header-cell-style="{ background: '#f4f4f5', color: '#606266' }"
          >
            <el-table-column label="账号名" align="center" prop="account" />
            <el-table-column label="用户昵称" align="center" prop="name" />
            <el-table-column label="手机号码" align="center" prop="mobile" />
            <el-table-column label="所属分组" align="center" prop="gid">
              <template #default="{ row }">
                <el-cascader
                  v-model.number="row.gid"
                  style="width: 100%"
                  :options="AuthorityOption"
                  :props="{ checkStrictly: true, label: 'gname', value: 'gid', disabled: 'disabled', emitPath: false }"
                  :show-all-levels="false"
                  filterable
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>

    <!-- 权限修改侧边栏 -->
    <el-drawer :with-header="false" v-if="drawerRouter" v-model="drawerRouter" size="40%" title="分组权限配置">
      <el-tabs class="role-box" type="border-card">
        <el-tab-pane :label="`【${curGroupName}】 权限菜单`">
          <div>
            <el-button class="fl-right" type="primary" @click="relation">确 定</el-button>
            <el-divider content-position="right">只读权限</el-divider>
          </div>
          <el-tree
            ref="menuTree"
            :data="menuTreeData"
            :default-checked-keys="menuTreeIds"
            :props="menuDefaultProps"
            default-expand-all
            highlight-current
            node-key="path"
            show-checkbox
          >
            <template #default="{ node, data }">
              <div class="custom-tree-node" style="width: 100%">
                <span>{{ node.label }}</span>
                <span style="float: right; margin-right: 40px">
                  <el-switch
                    v-if="isUnDef(data.children) && data.path !== '/welcome'"
                    :disabled="disableSwitches.includes(data.path) && readonlyMap[data.path] === 1"
                    inline-prompt
                    :active-icon="EpCheck"
                    :inactive-icon="EpClose"
                    active-color="#E6A23C"
                    v-model="readonlyMap[data.path]"
                    :active-value="1"
                    :inactive-value="0"
                  />
                </span>
              </div>
            </template>
          </el-tree>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>

    <!-- 新增分组弹窗 -->
    <el-dialog v-model="dialogFormVisible" :title="dialogTitle">
      <el-form ref="authorityForm" :model="form" :rules="rules" label-width="180px">
        <el-form-item label="父级分组" prop="parent_gid" style="width: 80%">
          <el-cascader
            v-model.number="form.parent_gid"
            style="width: 100%"
            :disabled="!isEditing"
            :options="AuthorityOption"
            :props="{ checkStrictly: true, label: 'gname', value: 'gid', disabled: 'disabled', emitPath: false }"
            :show-all-levels="false"
            filterable
          />
        </el-form-item>
        <el-form-item label="分组姓名" prop="gname" style="width: 80%">
          <el-input v-model="form.gname" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取 消</el-button>
          <el-button type="primary" @click="enterDialog">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="Group">
import EpCheck from "~icons/ep/check";
import EpClose from "~icons/ep/close";
import EpSetting from "~icons/ep/setting";
import EpPlus from "~icons/ep/plus";
import EpEdit from "~icons/ep/edit";
import EpDelete from "~icons/ep/delete";

import { ElMessage, ElMessageBox } from "element-plus";
import { HttpResponse } from "/@/utils/http/types";
import { isEmpty, isNull, isUnDef } from "/@/utils/is";
import { usePermissionStoreHook } from "/@/store/modules/permission";
import { useUserStore } from "/@/store/modules/user";
import { showMessage } from "/@/utils/message";
import { Ref } from "vue";

const { gid: operatorGid, id, isRootUser, isSuperGroup } = useUserStore(); // 操作人的Gid

const menuTreeIds = ref([]);
const readonlyMap = ref({});
const menuTree = ref(null); // 关联树 确认方法
const curGid = ref(0);
const curParentGid = ref(0);
const menuTreeData = ref(usePermissionStoreHook().wholeMenus);

const menuDefaultProps = ref({
  children: "children",
  label: function (data) {
    return data.meta.title;
  },
  disabled: data => {
    return disableTreeIds.value.includes(data.path);
  }
});

const relation = async () => {
  const checkArr: string[] = [...menuTree.value.getCheckedKeys(false), ...menuTree.value.getHalfCheckedKeys()];

  const routerList: { path: string; readonly: number }[] = [];
  checkArr.forEach(item => {
    routerList.push({ path: item, readonly: readonlyMap.value?.[item] ?? 0 });
  });

  await http.post("group/updateGroupRouter", { router_list: routerList, gid: curGid.value, parent_gid: curParentGid.value }).then(() => {
    drawerRouter.value = false;
    getTableData();
  });
};

const multiUpdateUserGid = async () => {
  const userGidList = [];
  const selfId = id;
  userListData.value.forEach(item => {
    if (selfId === item.id) {
      return;
    }
    userGidList.push({ id: item.id, gid: item.gid });
  });

  await http.post("/user/multiUpdateUserGid", { userGidList: userGidList }).then(() => {
    drawerUserList.value = false;
    getTableData();
  });
};

const disableTreeIds = ref([]);
const disableSwitches = ref([]);

function disabledTreeIds() {
  disableTreeIds.value = ["/", "/welcome"];
  disableSwitches.value = [];

  if (curParentGid.value === 0 || isUnDef(groupRouterMap.value.get(curParentGid.value))) {
    return;
  }

  const parentRouterList = groupRouterMap.value.get(curParentGid.value);

  const parentRouterMap: Map<string, number> = new Map();
  parentRouterList.forEach((v: { path; readonly }) => {
    parentRouterMap.set(v.path, v.readonly);
  });

  let readonly = 0;
  allPathList.value.forEach(item => {
    readonly = parentRouterMap.get(item);

    if (readonly !== 0) {
      disableSwitches.value.push(item);

      if (isUnDef(readonly)) {
        disableTreeIds.value.push(item);
      }
    }
  });
}

const initDrawerRouter = row => {
  curGid.value = row.gid;
  curParentGid.value = row.parent_gid;

  getMenuTreeIds(row.router_list);

  disabledTreeIds();
};

function findParentPath(item, parentPathList) {
  if (!isEmpty(item.children) && !isUnDef(item.children)) {
    parentPathList.push(item.path);

    item.children.forEach(item2 => {
      findParentPath(item2, parentPathList);
    });
  }
}

const parentPathList = getParentPathList();

function getParentPathList() {
  const parentPathList = [];
  menuTreeData.value.forEach(item => {
    findParentPath(item, parentPathList);
  });

  return parentPathList;
}

function getMenuTreeIds(routerList) {
  // 获取自己可见的菜单树
  const routers = ["/", "/welcome"];
  const readOnlyArr = {};
  routerList.forEach(item => {
    if (routers.includes(item.path) || parentPathList.includes(item.path)) {
      return;
    }
    routers.push(item.path);
    readOnlyArr[item.path] = item?.readonly ?? 0;
  });

  menuTreeIds.value = routers;
  readonlyMap.value = readOnlyArr;
}

const userListData = ref([]);
const userDrawerLoading = ref(false);

const initDrawerUserList = async row => {
  userDrawerLoading.value = true;
  await http.get("user/getUserListByGid", { gid: row.gid }).then((data: HttpResponse) => {
    if (data.code === 0) {
      const { list } = data.data;
      userListData.value = list;
    }
    userDrawerLoading.value = false;
  });
};

const AuthorityOption = ref([]);

const isEditing = ref(false);
const dialogTitle = ref("新增分组");
const dialogFormVisible = ref(false);
const apiDialogFlag = ref(false);

const form = ref({
  gid: 0,
  gname: "",
  parent_gid: 0
});

const rules = ref({
  gname: [{ required: true, message: "请输入分组名", trigger: "blur" }],
  parent_gid: [{ required: true, message: "请选择请求方式", trigger: "blur" }]
});

const tableData = ref([]);
const parentGidList = ref([]);
const loading = ref(false);

// 查询
const getTableData = async () => {
  loading.value = true;
  await http.get("group/getGroupList", { gid: operatorGid }).then((data: HttpResponse) => {
    if (data.code === 0) {
      const { list } = data.data;
      tableData.value = list;

      for (const listElement of list) {
        parentGidList.value.push(listElement.gid);
      }

      fullInGroupMap(list);

      buildAllPathList(menuTreeData.value);

      loading.value = false;
    }
  });
};

const groupRouterMap: Ref<Map<number, []>> = ref(new Map());

function fullInGroupMap(groupList) {
  groupList.forEach(item => {
    groupRouterMap.value.set(item.gid, item.router_list);
    if (!isNull(item.children)) {
      fullInGroupMap(item.children);
    }
  });
}

const allPathList = ref([]);

function buildAllPathList(routerList) {
  routerList.forEach(item => {
    allPathList.value.push(item.path);
    if (!isUnDef(item.children)) {
      buildAllPathList(item.children);
    }
  });
}

getTableData();

const drawerRouter = ref(false);
const curGroupName = ref("");

// 打开权限侧边栏
const openDrawerRouter = row => {
  if (operatorGid === row.gid) {
    showMessage("不能设置自己所在分组权限", "warning");
    return;
  }
  drawerRouter.value = true;
  curGroupName.value = row.gname;
  initDrawerRouter(row);
};

const drawerUserList = ref(false);

//查询此分组的用户列表
function openDrawerUserList(row) {
  drawerUserList.value = true;
  curGroupName.value = row.gname;
  userListData.value = [];

  setOptions();
  initDrawerUserList(row);
}

// 删除分组
const deleteAuth = row => {
  if (operatorGid === row.gid) {
    showMessage("不能删除自己所在分组", "warning");
    return;
  }
  ElMessageBox.confirm("此操作将永久删除该分组, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      await http.post("group/deleteGroup", { gid: row.gid }, false).then((data: HttpResponse) => {
        if (data.code === 0) {
          getTableData();
        }
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消删除"
      });
    });
};

const authorityForm = ref(null);

// 初始化表单
const initForm = () => {
  if (authorityForm.value) {
    authorityForm.value.resetFields();
  }
  form.value = {
    gid: 0,
    gname: "",
    parent_gid: 0
  };
};

// 关闭窗口
const closeDialog = () => {
  initForm();
  dialogFormVisible.value = false;
  apiDialogFlag.value = false;
};

// 确定弹窗
const enterDialog = () => {
  authorityForm.value.validate(async valid => {
    if (!valid) {
      return;
    }

    const url = isEditing.value ? "group/updateGroup" : "group/createGroup";
    http.post(url, form.value).then((data: HttpResponse) => {
      if (data.code === 0) {
        getTableData();
        closeDialog();
      }
    });
  });
};
const setOptions = () => {
  AuthorityOption.value = [];

  AuthorityOption.value.push({ gid: -1, gname: "游客分组" });
  if (isRootUser) {
    AuthorityOption.value.push({ gid: 0, gname: "根分组" });
  }
  setAuthorityOptions(tableData.value, AuthorityOption.value, false);
};
const setAuthorityOptions = (AuthorityData, optionsData, disabled) => {
  AuthorityData &&
    AuthorityData.forEach(item => {
      const isDisabled = disabled || item.gid === form.value.gid;
      const option = {
        gid: item.gid,
        gname: item.gname,
        disabled: isDisabled,
        children: []
      };

      if (item.children && item.children.length) {
        setAuthorityOptions(item.children, option.children, isDisabled);
        optionsData.push(option);
      } else {
        delete option.children;
        optionsData.push(option);
      }
    });
};

// const setAuthorityOptions = (AuthorityData, optionsData, disabled) => {
//   AuthorityData &&
//     AuthorityData.forEach(item => {
//       const isDisabled = disabled || item.gid === form.value.gid;
//       if (item.children && item.children.length) {
//         const option = {
//           gid: item.gid,
//           gname: item.gname,
//           disabled: isDisabled,
//           children: []
//         };
//         setAuthorityOptions(item.children, option.children, isDisabled);
//         optionsData.push(option);
//       } else {
//         const option = {
//           gid: item.gid,
//           gname: item.gname,
//           disabled: isDisabled
//         };
//         optionsData.push(option);
//       }
//     });
// };

// 增加分组
const addAuthority = parentGid => {
  initForm();
  dialogTitle.value = "新增分组";
  isEditing.value = false;
  form.value.parent_gid = parentGid;
  setOptions();
  dialogFormVisible.value = true;
};

// 编辑分组
const editAuthority = row => {
  if (operatorGid === row.gid) {
    showMessage("不能编辑自己所在分组", "warning");
    return;
  }
  setOptions();
  dialogTitle.value = "编辑分组";
  isEditing.value = true;
  for (const key in form.value) {
    form.value[key] = row[key];
  }

  setOptions();
  dialogFormVisible.value = true;
};

const tableRowClassName = ({ row }) => {
  if (row.parent_gid === 0) {
    return "layer-row-1";
  }
  if (parentGidList.value.includes(row.parent_gid)) {
    return "layer-row-2";
  }

  return "";
};
</script>

<style lang="scss">
.authority {
  .el-input-number {
    margin-left: 15px;

    span {
      display: none;
    }
  }
}

.role-box {
  .el-tabs__content {
    height: calc(100vh - 72px);
    overflow: auto;
  }
}

.el-table .layer-row-1 {
  --el-table-tr-bg-color: var(--el-color-success-light-7);
}

.el-table .layer-row-2 {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>
