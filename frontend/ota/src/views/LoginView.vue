<template>
  <div class="login-wrapper">
    <div class="login">
      <LabelInput :label="id" @update:data="($event) => (id.data = $event)" />
      <LabelInput :label="pw" @update:data="($event) => (pw.data = $event)" />
      <LoginButton :btn="loginBtn" @click:clk="($event) => loginFn()" />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

// Components
import LabelInput from "../components/LabelInput.vue";
import LoginButton from "../components/LoginButton.vue";
import axios from "axios";
import router from "@/router";

export default defineComponent({
  name: "LoginView",
  data: () => ({
    id: { text: "id", type: "id", id: "id", data: "" },
    pw: { text: "password", type: "password", id: "password", data: "" },
    loginBtn: { text: "login" },
  }),
  components: {
    LabelInput,
    LoginButton,
  },
  methods: {
    loginFn() {
      const user = { id: this.id.data, pw: this.pw.data };
      axios
        .post("/backend/login", user)
        .then((res) => {
          if (res.data.search) {
            router.push("/main");
          } else {
            alert("아이디와 패스워드가 틀립니다.");
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
});
</script>
<style>
.login {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
