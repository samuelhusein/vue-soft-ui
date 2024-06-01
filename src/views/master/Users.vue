<template>
  <div class="px-5 container-fluid">
    <h4>Manage Users</h4>
    <div class="row">
      <div class="col-12">
        <div class="grid">
          <div class="col-12">
            <div class="card">
              <DataTableComponent
                title="Manage Users"
                :columns="columns"
                :data="users"
                :totalRecords="totalRecords"
                :rows="10"
                :first="0"
                fileAccept=".xls, .xlsx"
                :filters="filters"
                :showViewButton="false"
                :showEditButton="true"
                :showDeleteButton="false"
                @open-new="openNew"
                @edit-item="editUser"
                @update-data="fetchData"
                @file-upload="importFile"
              />

              <Dialog
                v-model:visible="userDialog"
                :style="{ width: '450px' }"
                header="User Details"
                :modal="true"
                class="p-fluid"
              >
                <div class="field">
                  <label for="name">Name</label>
                  <InputText
                    id="name"
                    v-model.trim="user.name"
                    required
                    autofocus
                    :invalid="submitted && !user.name"
                  />
                  <small class="p-invalid" v-if="submitted && !user.name"
                    >Name is required.</small
                  >
                </div>
                <div class="field" v-if="isNewUser">
                  <label for="email">Email</label>
                  <InputText
                    id="email"
                    v-model.trim="user.email"
                    required
                    autofocus
                    :invalid="submitted && !user.email"
                  />
                  <small class="p-invalid" v-if="submitted && !user.email"
                    >Email is required.</small
                  >
                </div>
                <div class="field">
                  <label for="inventoryStatus" class="mb-3">Role</label>
                  <Dropdown
                    id="inventoryStatus"
                    v-model="user.role"
                    :options="statuses"
                    optionLabel="label"
                    placeholder="Select a Status"
                  >
                    <template #value="slotProps">
                      <div v-if="slotProps.value && slotProps.value.value">
                        <span
                          :class="
                            'product-badge status-' + slotProps.value.value
                          "
                          >{{ slotProps.value.label }}</span
                        >
                      </div>
                      <div
                        v-else-if="slotProps.value && !slotProps.value.value"
                      >
                        <span
                          :class="
                            'product-badge status-' +
                            slotProps.value.toLowerCase()
                          "
                          >{{ slotProps.value }}</span
                        >
                      </div>
                      <span v-else>{{ slotProps.placeholder }}</span>
                    </template>
                  </Dropdown>
                </div>
                <div class="field" v-if="showPartnerIdField">
                  <label for="partner_id">Partner ID</label>
                  <Dropdown
                    id="partner_id"
                    v-model="user.partner_id"
                    :options="partnerId"
                    optionLabel="label"
                    placeholder="Select Partner ID"
                  >
                    <!-- Dropdown options and template -->
                  </Dropdown>
                  <small class="p-invalid" v-if="submitted && !user.partner_id">
                    Partner ID is required.
                  </small>
                </div>
                <template #footer>
                  <Button
                    label="Cancel"
                    icon="pi pi-times"
                    text
                    @click="hideDialog"
                  />
                  <Button
                    label="Save"
                    icon="pi pi-check"
                    text
                    @click="saveUser"
                  />
                </template>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, watch } from "vue";
import { useToast } from "primevue/usetoast";
import {
  authenticatedGet,
  authenticatedPut,
  authenticatedPost,
} from "@/service/Api.js";
import DataTableComponent from "../components/DataTableComponents.vue";
import { FilterMatchMode } from "primevue/api";

const toast = useToast();

const users = ref(null);
const userDialog = ref(false);
const user = ref({});
const selectedUsers = ref(null);
const filters = ref({});
const submitted = ref(false);
const isNewUser = ref(false);
const totalRecords = ref(0);

const statuses = ref([
  { label: "Admin", value: "admin" },
  { label: "Partner", value: "partner" },
]);

const partnerId = ref([
  { label: "asd", value: "asd" },
  { label: "dsa", value: "das" },
]);

const columns = [
  { field: "name", header: "Name", headerStyle: "min-width:10rem;" },
  { field: "role", header: "Role", headerStyle: "min-width:10rem;" },
  {
    field: "partner_id",
    header: "Partner ID",
    headerStyle: "min-width:10rem;",
  },
];


const fetchData = async (event) => {
  const response = await authenticatedGet(`user`, { params: event });
  if (response.status) {
    users.value = response.data.data;
    totalRecords.value = response.data.meta.total;
  }
};

onBeforeMount(() => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
});
onMounted(() => {
  fetchData();
});

const showPartnerIdField = ref(false);

// Watch for changes to the user's role
watch(user, (newValue, oldValue) => {
  console.log(user);
  // Update the visibility of the Partner ID field based on the new role
  showPartnerIdField.value = newValue === 'partner';
});

const openNew = () => {
  user.value = {};
  submitted.value = false;
  isNewUser.value = true;
  userDialog.value = true;
};

const hideDialog = () => {
  userDialog.value = false;
  submitted.value = false;
};

const updateUser = async (id, payload) => {
  const response = await authenticatedPut(`user/${id}`, payload);
  if (response.status) {
    return true;
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "User failed to update",
      life: 3000,
    });
  }
};

const createUser = async (payload) => {
  const response = await authenticatedPost(`user/`, payload);
  if (response.status) {
    return true;
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "User failed to create",
      life: 3000,
    });
  }
};

const saveUser = () => {
  submitted.value = true;
  if (
    user.value.name &&
    user.value.name.trim() &&
    user.value.partner_id &&
    (isNewUser.value ? user.value.email && user.value.email.trim() : true)
  ) {
    const payload = {
      name: user.value.name,
      role: user.value.role.value,
      partner_id: user.value.partner_id,
    };

    if (isNewUser.value) {
      payload.email = user.value.email;
      createUser(payload).then((result) => {
        if (result) {
          toast.add({
            severity: "success",
            summary: "Successful",
            detail: "User Created",
            life: 3000,
          });
          fetchData();
        }
      });
    } else {
      updateUser(user.value.id, payload).then((result) => {
        if (result) {
          toast.add({
            severity: "success",
            summary: "Successful",
            detail: "User Updated",
            life: 3000,
          });
          fetchData();
        }
      });
    }

    userDialog.value = false;
    user.value = {};
  }
};

const editUser = (editUser) => {
  user.value = { ...editUser };
  isNewUser.value = false;
  userDialog.value = true;
};

const importFile = (event) => {
  // Handle file import
};
</script>
