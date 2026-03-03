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
      <MainModal :modal="modalForm" @click:clk="($event) => updateFn()">
        <template #openModal="{ modal }">
          <MainButton :btn="updateBtn" :modal="modal" />
        </template>
        <template #modalBody>
          <BodyModal @change:chg="($event) => handleFileChange($event)" />
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
  });
};

onMounted(() => {
  fetchData();

  socket.on("status", (data) => {
    console.log(data, "socket", firmware.value);
    for (let key in data) {
      firmware.value[key]["status"] = data[key];
    }
  });
  socket.on("ip", (data) => {
    for (let key in data) {
      firmware.value[key]["ip"] = data[key];
    }
  });
  socket.on("firmware", (data) => {
    console.log("firmware 소켓 도착", data);
    firmwareList.value = data;
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
import BodyModal from "../components/BodyModal.vue";
const firmware = ref({});
const firmwareFile = ref([]);
const firmwareList = ref([]);

export default defineComponent({
  name: "MainView",
  data: () => ({
    saveBtn: { text: "저장" },
    updateBtn: {
      text: "업로드",
      "data-bs-target": "exampleModal",
      "data-bs-toggle": "modal",
    },
    modalForm: {
      title: "폼웨어 업로드",
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
      axios.put("/backend/firmware", firmware.value).then((res) => {
        console.log(res.data);
        if (res.data[0].length == 0) {
          alert("성공적으로 변경되었습니다.");
        } else {
          alert(`일부 변경에 실패했습니다. [${res.data[0]}]`);
        }
      });
    },
    updateFn() {
      const firmwareFormData = new FormData();
      firmwareFormData.append("upload", firmwareFile.value[0]);
      axios.post("/backend/firmware", firmwareFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // .then((res) => {
      //   alert(res.data.message);
      // });
    },
    handleFileChange(event) {
      firmwareFile.value = Array.from(event.target.files);
    },
    changeFirmware(event, index) {
      firmware.value[index]["upload firmware"] = event.target.value;
    },
  },
  components: { MainTable, MainButton, MainModal, BodyModal },
});
</script>

<style>
.button-div {
  display: flex;
  width: 10%;
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
