<template>
  <div>
    <el-card>
      <el-row>
        <el-input style="width: 22%; margin-right: 10px" v-model="searchInfo.user_account" placeholder="输入操作人账号名">
          <template #prepend>操作人：</template>
        </el-input>
        <el-input style="width: 30%" v-model="searchInfo.path" placeholder="输入请求路径(可模糊查询)">
          <template #prepend>请求路径：</template>
        </el-input>
        <div style="margin-left: 20px">
          <el-button type="primary" :icon="EpSearch" @click="onSubmit">查询</el-button>
          <el-button :icon="EpRefresh" @click="onReset">重置</el-button>
        </div>
      </el-row>
      <hr style="margin: 10px 0" />
      <el-table stripe border :data="tableData" :header-cell-style="{ background: '#f4f4f5', color: '#606266' }">
        <el-table-column align="center" label="ID" width="120" prop="ID" />
        <el-table-column align="center" label="操作人" width="140" prop="user_account" />
        <el-table-column align="center" label="日期" width="180" prop="CreatedAt" :formatter="formatData" />
        <el-table-column align="center" label="状态码" prop="status" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 200" type="success">{{ row.status }}</el-tag>
            <el-tag v-else type="warning">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" label="请求IP" prop="ip" width="120" />
        <el-table-column align="left" label="请求方法" prop="method" width="120" />
        <el-table-column align="left" label="请求数据" prop="body" width="100">
          <template #default="{ row }">
            <div>
              <el-popover v-if="row.body" placement="left-start" trigger="click">
                <div class="popover-box">
                  <pre>{{ fmtBody(row.body) }}</pre>
                </div>
                <template #reference>
                  <el-icon style="cursor: pointer"><ep-warning-filled /></el-icon>
                </template>
              </el-popover>

              <span v-else>无</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="响应数据" prop="resp" width="100">
          <template #default="{ row }">
            <div>
              <el-popover v-if="row.resp" placement="left-start" trigger="click">
                <div class="popover-box">
                  <pre>{{ fmtBody(row.resp) }}</pre>
                </div>
                <template #reference>
                  <el-icon style="cursor: pointer"><ep-warning-filled /></el-icon>
                </template>
              </el-popover>
              <span v-else>无</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="请求路径" prop="path" min-width="240" />
      </el-table>
      <ant-pagination v-model="pagination" :total="total" />
    </el-card>
  </div>
</template>

<script setup name="OperationLog">
import AntPagination from "/@/components/AntPagination/index.vue";
import EpSearch from "~icons/ep/search";
import EpRefresh from "~icons/ep/refresh";
import EpWarningFilled from "~icons/ep/warning-filled";
import dayjs from "dayjs";

let pagination = ref({
  pageSize: 10,
  currentPage: 1
});

watch(pagination.value, () => {
  getTableData();
});

const page = ref(1);
const total = ref(0);
const pageSize = ref(10);
const tableData = ref([]);
const searchInfo = ref({});

const onReset = () => {
  searchInfo.value = {};
};
// 条件搜索前端看此方法
const onSubmit = () => {
  page.value = 1;
  pageSize.value = 10;
  getTableData();
};

// 查询
const getTableData = () => {
  const params = { page: pagination.value.currentPage, pageSize: pagination.value.pageSize, ...searchInfo.value };

  http.get("sysOperationRecord/getSysOperationRecordList", params).then(table => {
    if (table.code === 0) {
      tableData.value = table.data.list;
      total.value = table.data.total;
    }
  });
};

function formatData(row, column, cellValue) {
  return dayjs(cellValue * 1000).format("YYYY-MM-DD HH:mm:ss");
}

getTableData();

const fmtBody = value => {
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
};
</script>

<style lang="scss">
.table-expand {
  padding-left: 60px;
  font-size: 0;

  label {
    width: 90px;
    color: #99a9bf;

    .el-form-item {
      margin-right: 0;
      margin-bottom: 0;
      width: 50%;
    }
  }
}

.popover-box {
  background: #112435;
  color: #f08047;
  height: 600px;
  width: 420px;
  overflow: auto;
}

.popover-box::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
</style>
