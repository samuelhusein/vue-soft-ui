<template>
  <div class="card mb-4">
    <div class="card-body px-0 pt-0 pb-2">
      <DataTable
        id="user-table"
        :options="dataTableOptions"
        :columns="columns"
        :data="users"
        class="table table-hover table-striped"
        width="100%"
      />
    </div>
  </div>
</template>

<script>
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net-bs5";
import { authenticatedGet } from "@/service/Api.js";
DataTable.use(DataTablesCore);

export default {
  name: "UserTable",
  components: {
    DataTable,
  },
  data() {
    return {
      users: [],
      columns: [
        { title: "Name", data: "name" },
        { title: "Role", data: "role" },
        { title: "Partner ID", data: "partner_id" },
      ],
      dataTableOptions: {
        serverSide: true,
        processing: true,
        ajax: this.fetchData,
      },
    };
  },
  methods: {
    async fetchData(data, callback) {
      try {
        const response = await authenticatedGet("user", { params: data });
        if (response.status === 200) {
          callback({
            draw: data.draw,
            recordsTotal: response.data.meta.total,
            recordsFiltered: response.data.meta.total,
            data: response.data.data,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
  },
};
</script>
