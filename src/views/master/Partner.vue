<template>
  <div class="px-5 container-fluid">
    <h4>Manage Partners</h4>
    <div class="row">
      <div class="col-12">
        <div class="grid">
          <div class="col-12">
            <div class="card">
              <DataTableComponent
                title="Manage Partners"
                :columns="columns"
                :data="partners"
                :totalRecords="totalRecords"
                :rows="10"
                :first="0"
                fileAccept=".xls, .xlsx"
                :filters="filters"
                :showViewButton="false"
                :showEditButton="true"
                :showDeleteButton="true"
                @open-new="openNew"
                @edit-item="editPartner"
                @delete-item="deletePartner"
                @see-item="seePartner"
                @update-data="fetchData"
                @file-upload="importFile"
              />

              <Dialog
                v-model:visible="partnerDialog"
                :style="{ width: '450px' }"
                header="Partner Details"
                :modal="true"
                class="p-fluid"
              >
                <div class="field">
                  <label for="name">Name</label>
                  <InputText
                    id="name"
                    v-model.trim="partner.name"
                    required
                    autofocus
                    :invalid="submitted && !partner.name"
                  />
                  <small class="p-invalid" v-if="submitted && !partner.name"
                    >Name is required.</small
                  >
                </div>
                <div class="field">
                  <label for="companyName">Company Name</label>
                  <InputText
                    id="companyName"
                    v-model.trim="partner.company_name"
                    required
                    autofocus
                    :invalid="submitted && !partner.company_name"
                  />
                  <small
                    class="p-invalid"
                    v-if="submitted && !partner.company_name"
                    >Company Name is required.</small
                  >
                </div>
                <div class="field">
                  <label for="logo">Logo</label>

                  <FileUpload
                    mode="basic"
                    id="logo"
                    required
                    autofocus
                    :invalid="submitted && !partner.logo"
                    :value="partner.logo"
                    :accept="fileAccept"
                    :maxFileSize="1000000"
                    label="Import"
                    chooseLabel="Import"
                    class="mr-2 inline-block"
                    @change="importFile"
                  />
                  <small class="p-invalid" v-if="submitted && !partner.logo"
                    >Logo is required.</small
                  >
                </div>
                <div class="field">
                  <label for="address">Address</label>
                  <Textarea
                    id="address"
                    v-model="partner.address"
                    required="true"
                    rows="3"
                    cols="20"
                  />
                  <small class="p-invalid" v-if="submitted && !partner.address"
                    >Address is required.</small
                  >
                </div>
                <div class="field">
                  <label for="phoneNumber">Phone Number</label>
                  <InputText
                    id="phoneNumber"
                    v-model.trim="partner.phone_number"
                    required
                    autofocus
                    :invalid="submitted && !partner.phone_number"
                  />
                  <small
                    class="p-invalid"
                    v-if="submitted && !partner.phone_number"
                    >Phone Number is required.</small
                  >
                </div>
                <div class="field">
                  <label for="deposit">Deposit Amount</label>
                  <InputNumber
                    id="deposit"
                    v-model.trim="partner.deposit_amount"
                    required
                    autofocus
                    :invalid="submitted && !partner.deposit_amount"
                  />
                  <small
                    class="p-invalid"
                    v-if="submitted && !partner.deposit_amount"
                    >Deposit Amount is required.</small
                  >
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
                    @click="savePartner"
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
import { ref, onMounted, onBeforeMount } from "vue";
import { useToast } from "primevue/usetoast";
import {
  authenticatedGet,
  authenticatedPut,
  authenticatedPost,
  authenticatedDelete,
} from "@/service/Api.js";
import DataTableComponent from "../components/DataTableComponents.vue";
import { FilterMatchMode } from "primevue/api";

const toast = useToast();

const partners = ref(null);
const partnerDialog = ref(false);
const partner = ref({});
const selectedPartners = ref(null);
const filters = ref({});
const submitted = ref(false);
const isNewPartner = ref(false);
const totalRecords = ref(0);

const columns = [
  { field: "name", header: "Name", headerStyle: "min-width:10rem;" },
  {
    field: "company_name",
    header: "Company Name",
    headerStyle: "min-width:10rem;",
  },
  { field: "logo", header: "Logo", headerStyle: "min-width:10rem;" },
  { field: "address", header: "Address", headerStyle: "min-width:10rem;" },
  {
    field: "phone_number",
    header: "Phone Number",
    headerStyle: "min-width:10rem;",
  },
  {
    field: "deposit_amount",
    header: "Deposit Amount",
    headerStyle: "min-width:10rem;",
  },
];

const fetchData = async (payload) => {
  if (!payload) {
    return;
  }

  const response = await authenticatedGet(`partner`, {
    page: payload.page,
    per_page: payload.per_page,
  });
  if (response.status) {
    partners.value = response.data.data;
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

const openNew = () => {
  partner.value = {};
  submitted.value = false;
  isNewPartner.value = true;
  partnerDialog.value = true;
};

const hideDialog = () => {
  partnerDialog.value = false;
  submitted.value = false;
};

const updatePartner = async (id, payload) => {
  const response = await authenticatedPut(`partner/${id}`, payload);
  if (response.status) {
    return true;
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Partner failed to update",
      life: 3000,
    });
  }
};

const createPartner = async (payload) => {
  const response = await authenticatedPost(`partner/`, payload);
  if (response.status) {
    return true;
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Partner failed to create",
      life: 3000,
    });
  }
};
const savePartner = () => {
  submitted.value = true;
  if (
    partner.value.name &&
    partner.value.name.trim() &&
    partner.value.company_name &&
    partner.value.address &&
    partner.value.deposit_amount
  ) {
    if (partner.value.file) {
      // If there's a file, handle file upload along with partner creation/update
      const fileReader = new FileReader();
      fileReader.readAsDataURL(partner.value.file);
      fileReader.onload = () => {
        const fileData = fileReader.result.split(",")[1]; // Extract base64 string
        const payload = {
          name: partner.value.name,
          company_name: partner.value.company_name,
          logo: fileData,
          address: partner.value.address,
          deposit_amount: partner.value.deposit_amount,
          file: fileData,
        };
        if (isNewPartner.value) {
          createPartner(payload)
            .then((result) => {
              if (result) {
                toast.add({
                  severity: "success",
                  summary: "Successful",
                  detail: "Partner Created",
                  life: 3000,
                });
                fetchData();
              }
            })
            .catch((error) => {
              console.error("Error creating partner:", error);
              toast.add({
                severity: "error",
                summary: "Error",
                detail: "Failed to create partner",
                life: 3000,
              });
            });
        } else {
          updatePartner(partner.value.id, payload)
            .then((result) => {
              if (result) {
                toast.add({
                  severity: "success",
                  summary: "Successful",
                  detail: "Partner Updated",
                  life: 3000,
                });
                fetchData();
              }
            })
            .catch((error) => {
              console.error("Error updating partner:", error);
              toast.add({
                severity: "error",
                summary: "Error",
                detail: "Failed to update partner",
                life: 3000,
              });
            });
        }
      };
    } else {
      // If no file is selected, proceed with partner creation/update without file upload
      const payload = {
        name: partner.value.name,
        company_name: partner.value.company_name,
        logo: partner.value.logo,
        address: partner.value.address,
        deposit_amount: partner.value.deposit_amount,
      };
      if (isNewPartner.value) {
        createPartner(payload)
          .then((result) => {
            if (result) {
              toast.add({
                severity: "success",
                summary: "Successful",
                detail: "Partner Created",
                life: 3000,
              });
              fetchData();
            }
          })
          .catch((error) => {
            console.error("Error creating partner:", error);
            toast.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to create partner",
              life: 3000,
            });
          });
      } else {
        updatePartner(partner.value.id, payload)
          .then((result) => {
            if (result) {
              toast.add({
                severity: "success",
                summary: "Successful",
                detail: "Partner Updated",
                life: 3000,
              });
              fetchData();
            }
          })
          .catch((error) => {
            console.error("Error updating partner:", error);
            toast.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to update partner",
              life: 3000,
            });
          });
      }
    }
    partnerDialog.value = false;
    partner.value = {};
  }
};

const editPartner = (editPartner) => {
  partner.value = { ...editPartner };
  isNewPartner.value = false;
  partnerDialog.value = true;
};

const deletePartner = async (deletePartner) => {
  const response = await authenticatedDelete(`partner/${deletePartner.id}`);
  if (response.status) {
    toast.add({
      severity: "success",
      summary: "Successful",
      detail: "Partner Deleted",
      life: 3000,
    });
    fetchData();
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Partner failed to delete",
      life: 3000,
    });
  }
};

const seePartner = (seePartner) => {
  // Logic to handle viewing partner details
};

const importFile = (event) => {
  // Handle file import
  partner.value.file = event.target.files[0];
};
</script>
