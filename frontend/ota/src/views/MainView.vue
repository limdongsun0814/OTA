<template>
  <div class="table-wrapper">
    <div class="table-div">
      <MainTable
        :firmwareList="firmwareList"
        :firmware="firmware"
        @change:chg="($event, index) => changeFirmware($event, index)"
      />
    </div>
    <div class="button-div">
      <MainButton :btn="saveBtn" @click:clk="($event) => saveFn()" />

      <MainModal :modal="uploadModalForm" @click:clk="($event) => updateFn()">
        <template #openModal="{ modal }">
          <MainButton :btn="uploadBtn" :modal="modal" />
        </template>
        <template #modalBody>
          <UploadBodyModal @change:chg="($event) => handleFileChange($event)" />
        </template>
      </MainModal>

      <MainModal
        :modal="removeModalForm"
        @click:clk="($event) => removeFirmwareFn()"
      >
        <template #openModal="{ modal }">
          <MainButton :btn="removeBtn" :modal="modal" />
        </template>
        <template #modalBody>
          <FirmwareRMBodyModal
            :unusedFirmware="unusedFirmware"
            @change:chg="($event) => handleUnusedFirmware($event)"
          />
        </template>
      </MainModal>
    </div>
  </div>
</template>
<script setup>
import { io } from "socket.io-client";

const socketHostname = process.env.VUE_APP_SOCKET_HOSTNAME;
const socketPort = process.env.VUE_APP_SOCKET_PORT;
// console.log(`http://${socketHostname}:${socketPort}`, "ddddddddddd");
const socket = io(`http://${socketHostname}:${socketPort}`);

const fetchData = async () => {
  axios.get("/backend/mcu").then((res) => {
    const result = {};
    for (let arr of res.data) {
      result[arr["chip_id"]] = arr;
    }
    firmware.value = result;
    console.log(firmware.value, res.data, "result");
    // firmware.value = res.data;
  });
  axios.get("/backend/firmware").then((res) => {
    console.log(res.data, "firmwareList");
    firmwareList.value = res.data;
  });
  axios.get("/backend/firmware/unused").then((res) => {
    res.data.forEach((item) => {
      unusedFirmware.value[item.file_name] = item;
    });
  });
};

onMounted(() => {
  fetchData();

  socket.on("disconnect", () => {});

  socket.on("connect", () => {});

  socket.on("status", (data) => {
    console.log(data, "socket", firmware.value);
    for (let key in data) {
      firmware.value[key]["status"] = data[key];
    }
    console.log(firmware.value);
  });
  socket.on("ip", (data) => {
    for (let key in data) {
      firmware.value[key]["ip"] = data[key];
    }
  });
  // socket.on("firmware", (data) => {
  //   console.log("firmware 소켓 도착", data);
  //   firmwareList.value = data;
  // });
  socket.on("FirmwareList", (data) => {
    console.log("FirmwareList 소켓 도착", data);
    firmwareList.value = data;
  });
  socket.on("FirmwareUnused", (data) => {
    console.log("FirmwareRemove 소켓 도착", data);
    unusedFirmware.value = {};

    data.forEach((item) => {
      unusedFirmware.value[item.file_name] = item;
    });
  });
});
onUnmounted(() => {
  socket.disconnect();
});
</script>
<script>
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import axios from "axios";
import MainTable from "../components/MainTable.vue";
import MainButton from "../components/MainButton.vue";
import MainModal from "../components/MainModal.vue";
import UploadBodyModal from "../components/UploadBodyModal.vue";
import FirmwareRMBodyModal from "@/components/FirmwareRMBodyModal.vue";
const firmware = ref({});
const firmwareFile = ref([]);
const firmwareList = ref([]);
const unusedFirmware = ref({});
const removeFirmwareList = ref({});

export default defineComponent({
  name: "MainView",
  data: () => ({
    saveBtn: { text: "저장" },

    removeBtn: {
      text: "펌웨어 삭제",
      "data-bs-target": "rmModal1",
      "data-bs-toggle": "modal",
    },
    uploadBtn: {
      text: "업로드",
      "data-bs-target": "uploadModal",
      "data-bs-toggle": "modal1",
    },

    uploadModalForm: {
      title: "펌웨어 업로드11",
      "data-bs-target": "uploadModal",
      "data-bs-toggle": "modal",
    },
    removeModalForm: {
      title: "펌웨어 삭제",
      "data-bs-target": "rmModal1",
      "data-bs-toggle": "modal",
    },
  }),
  created() {
    /*
    axios.get("/backend/firmware").then((res) => {
      const result = {};
      for (let arr of res.data) {
        result[arr["chip_id"]["chip_id"]] = arr;
      }
      firmware.value = result;
      console.log(firmware.value, res.data, "result");
      // firmware.value = res.data;
    });
    axios.get("/backend/upload/firmware").then((res) => {
      console.log(res.data, "firmwareList");
      firmwareList.value = res.data;
    });*/
  },
  methods: {
    saveFn() {
      axios.put("/backend/mcu", firmware.value).then((res) => {
        // console.log(res.data);
        if (res.data[0].length == 0) {
          alert("성공적으로 변경되었습니다.");
          axios.get("/backend/mcu").then((res) => {
            const result = {};
            for (let arr of res.data) {
              result[arr["chip_id"]] = arr;
            }
            firmware.value = result;
            console.log(firmware.value, res.data, "result");
            // firmware.value = res.data;
          });
        } else {
          alert(`일부 변경에 실패했습니다. [${res.data[0]}]`);
        }
      });
    },
    updateFn() {
      const firmwareFormData = new FormData();
      firmwareFormData.append("upload", firmwareFile.value[0]);
      axios
        .post("/backend/firmware", firmwareFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          firmwareList.value = res.data.uploadFirmware;
        });
    },
    removeFirmwareFn() {
      console.log(removeFirmwareList.value);
      axios
        .delete("/backend/firmware/unused", { data: removeFirmwareList.value })
        .then((res) => {
          console.log(res.data);
          alert(`${res.data.deletedCount} 개 삭제되었습니다.`);
        });
    },
    handleUnusedFirmware(event) {
      if (event.target.checked)
        removeFirmwareList.value[event.target.value] = true;
      else delete removeFirmwareList.value[event.target.value];
      console.log(event.target.value);
    },
    handleFileChange(event) {
      firmwareFile.value = Array.from(event.target.files);
    },
    changeFirmware(event, index) {
      firmware.value[index]["upload firmware"] = event.target.value;
    },
  },
  components: {
    MainTable,
    MainButton,
    MainModal,
    UploadBodyModal,
    FirmwareRMBodyModal,
  },
});
</script>

<style>
.button-div {
  display: flex;
  width: 30%;
}
.table-div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.table-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
}
</style>
