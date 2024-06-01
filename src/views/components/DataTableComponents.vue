<template>
  <div>
    <Toolbar>
      <template v-slot:start>
        <Button
          label="New"
          icon="pi pi-plus"
          class="mr-2"
          severity="success"
          @click="emit('open-new')"
          style="border-radius: 5px;"
        ></Button>
      </template>
      <template v-slot:end>
        <FileUpload
          mode="basic"
          :accept="fileAccept"
          :maxFileSize="1000000"
          label="Import"
          chooseLabel="Import"
          class="inline-block"
          style="margin-right: 4px"
          @upload="onFileUpload"
        />
        <Button
          label="Export"
          icon="pi pi-upload"
          style="border-radius: 5px"
          severity="help"
          @click="exportCSV"
        />
      </template>
    </Toolbar>

    <DataTable
      ref="dt"
      :value="data"
      stripedRows
      v-model:selection="selectedItems"
      dataKey="id"
      :paginator="true"
      :rows="rows"
      :totalRecords="totalRecords"
      :lazy="true"
      :first="first"
      :filters="filters"
      @page="onPage"
      @sort="onSort"
      @filter="onFilter"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
    >
      <template #header>
        <div
          class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
        >
          <IconField iconPosition="left" class="block mt-2 md:mt-0">
            <InputIcon class="pi pi-search" />
            <InputText
              class="w-full sm:w-auto"
              v-model="filters['global'].value"
              placeholder="Search..."
            />
          </IconField>
        </div>
      </template>

      <Column
        v-for="col in columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="true"
        :headerStyle="col.headerStyle"
      >
        <template v-slot:body="slotProps">
          <span class="p-column-title">{{ col.header }}</span>
          <span style="text-transform: capitalize;">{{ slotProps.data[col.field] }}</span>
        </template>
      </Column>
      <Column headerStyle="min-width:10rem;width:14%" header="Action">
        <template #body="slotProps">
          <Button
            v-if="showViewButton"
            icon="pi pi-eye"
            class="mr-2"
            severity="info"
            rounded
            @click="$emit('see-item', slotProps.data)"
          />
          <Button
            v-if="showEditButton"
            icon="pi pi-pencil"
            class="mr-2"
            severity="success"
            rounded
            @click="$emit('edit-item', slotProps.data)"
          />
          <Button
            v-if="showDeleteButton"
            icon="pi pi-trash"
            class="mr-2"
            severity="danger"
            rounded
            @click="$emit('delete-item', slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  title: String,
  columns: Array,
  data: Array,
  totalRecords: Number,
  rows: Number,
  first: Number,
  fileAccept: String,
  filters: Object,
  showViewButton: {
    type: Boolean,
    default: true,
  },
  showEditButton: {
    type: Boolean,
    default: true,
  },
  showDeleteButton: {
    type: Boolean,
    default: true,
  },
});

const selectedItems = ref(null);
const toast = useToast();

const emit = defineEmits([
  "open-new",
  "see-item",
  "edit-item",
  "delete-item",
  "update-data",
  "file-upload",
]);

const onPage = (event) => {
  const payload = {
    per_page: event.rows,
    page: event.page + 1,
  };
  emit("update-data", payload);
};

const onSort = (event) => {
  const payload = {
    per_page: 1,
    page: event.page + 1,
  };
  emit("update-data", payload);
};

const onFilter = (event) => {
  const payload = {
    per_page: event.rows,
    page: event.page + 1,
  };
  emit("update-data", payload);
};

const onFileUpload = (event) => {
  emit("file-upload", event);
};

const exportCSV = () => {
  // Implement CSV export logic
  if (props.$refs.dt) {
    props.$refs.dt.exportCSV();
  }
};

onMounted(() => {
  // Load data when component is mounted
  loadData();
});

const loadData = () => {
  // Initial payload containing rows and page
  const initialPayload = {
    per_page: props.rows,
    page: props.first / props.rows + 1,
  };
  emit("update-data", initialPayload);
};
</script>
