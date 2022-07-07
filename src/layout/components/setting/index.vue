<script setup lang="ts">
import { useNav } from "../../hooks/nav";
import { useUserStore } from "/@/store/modules/user";
import type { FormInstance } from "element-plus";
import { HttpResponse } from "/@/utils/http/types";
import { showMessage } from "/@/utils/message";
import { storageSession } from "/@/utils/storage";
import EditCircleLine from "~icons/ri/edit-circle-line";
import LogoutCircleRLine from "~icons/ri/logout-circle-r-line";
import FsLogin from "/@/components/Fslogin/index.vue";

const { username } = useNav();

// 用户信息解析
const { id: userId, bindFs, fsHeadPic, headPic, isSuperGroup } = useUserStore();

const fsBindDialogVisible = ref(false);
const editPwdDialogVisible = ref(false);
const headPicDialogVisible = ref(false);
const selectedId = ref("");

const ruleFormRef = ref<FormInstance>();

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入新密码"));
  } else {
    if (pwdForm.checkPass !== "") {
      if (!ruleFormRef.value) return;
      ruleFormRef.value.validateField("checkPass", () => null);
    }
    callback();
  }
};
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请再次输入新密码"));
  } else if (value !== pwdForm.pass) {
    callback(new Error("两次新密码输入不一致!"));
  } else {
    callback();
  }
};

const pwdForm = reactive({
  pass: "",
  checkPass: "",
  oldPass: ""
});

const rules = reactive({
  pass: [{ required: true, validator: validatePass, trigger: "blur" }],
  checkPass: [{ required: true, validator: validatePass2, trigger: "blur" }],
  oldPass: [{ required: true, message: "请输入旧密码验证", trigger: "blur" }]
});

//登出 清空本地数据
function loginOut() {
  useUserStore().clearTokenCache();
}

//更新密码
function updatePwd() {
  const params = { id: userId, password: pwdForm.oldPass, newPassword: pwdForm.pass };

  http.post("user/changePassword", params).then((data: HttpResponse) => {
    if (data.code === 0) {
      editPwdDialogVisible.value = false;
      showMessage(`3秒后退回登录界面，请重新登录`, "warning");
      setTimeout(loginOut, 3000);
    }
  });
}

const submitForm = () => {
  const formEl = ruleFormRef.value;
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      updatePwd();
    }
  });
};

function updateHeadPic() {
  const headPicId = Number(selectedId.value);

  http.post("user/updateHeadPic", { id: userId, headPic: headPicId }).then((data: HttpResponse) => {
    if (data.code === 0) {
      headPicDialogVisible.value = false;

      useUserStore().headPic = headPicId;

      const userInfo = storageSession.getItem("user-info");
      userInfo.head_pic = headPicId;
      storageSession.setItem("user-info", userInfo);
    }
  });
}
</script>

<template>
  <span class="el-dropdown-link">
    <el-avatar v-if="bindFs" :size="44" :src="fsHeadPic" />
    <el-avatar v-else :size="44" :src="`src/assets/headIcon/head_${headPic}.png`" @click="headPicDialogVisible = true" />
  </span>
  <el-dropdown trigger="click">
    <span class="el-dropdown-link">
      <span>{{ username }}</span>
    </span>
    <template #dropdown>
      <el-dropdown-menu class="logout">
        <el-dropdown-item v-if="!bindFs && !isSuperGroup" @click="fsBindDialogVisible = true">
          <edit-circle-line style="margin: 5px" />关联飞书
        </el-dropdown-item>
        <el-dropdown-item @click="editPwdDialogVisible = true"> <edit-circle-line style="margin: 5px" />密码修改 </el-dropdown-item>
        <el-dropdown-item @click="loginOut"> <logout-circle-r-line style="margin: 5px" />退出系统 </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <div>
    <el-dialog v-model="editPwdDialogVisible" title="密码修改" width="30%" destroy-on-close center>
      <div>
        <el-form ref="ruleFormRef" :model="pwdForm" status-icon :rules="rules" label-width="120px">
          <el-form-item label="旧密码" prop="oldPass">
            <el-input v-model="pwdForm.oldPass" type="password" autocomplete="off" />
          </el-form-item>
          <el-form-item />
          <el-form-item label="新密码" prop="pass">
            <el-input v-model="pwdForm.pass" type="password" autocomplete="off" />
          </el-form-item>
          <el-form-item label="再次确认新密码" prop="checkPass">
            <el-input v-model="pwdForm.checkPass" type="password" autocomplete="off" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editPwdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  <div>
    <el-dialog v-model="fsBindDialogVisible" title="关联飞书" width="30%" destroy-on-close center>
      <div class="el-dialog--center">
        <fs-login title="关联" callback-func="base/fsBind" />
      </div>
    </el-dialog>
    <el-dialog v-model="headPicDialogVisible" title="头像选择" width="30%" destroy-on-close center>
      <el-row v-for="row in [1, 2, 3]" :key="row">
        <el-col
          :class="{ selected: `${row}${col}` === selectedId }"
          class="head-icon-select"
          :span="6"
          v-for="col in [1, 2, 3, 4]"
          :key="col"
          :style="'padding: 10px;'"
        >
          <el-image @click="selectedId = `${row}${col}`" class="icon-item" :src="`src/assets/headIcon/head_${row}${col}.png`" />
        </el-col>
      </el-row>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="headPicDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateHeadPic">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.el-dropdown-link {
  height: 48px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
  color: #000000d9;

  &:hover {
    background: #f6f6f6;
  }

  span {
    font-size: 16px;
  }

  el-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
  }
}

.icon-item {
  border-radius: 50%;
}

.head-icon-select {
  cursor: pointer;

  &:hover {
    background: #c6e2ff;
  }

  &:active {
    background: #a0cfff;
  }
}

.logout {
  max-width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    min-width: 100%;
    display: inline-flex;
    flex-wrap: wrap;
  }
}

.selected {
  background: #c6e2ff;
  box-shadow: 0 2px 7px 0 rgba(85, 110, 97, 0.35);
}
</style>
