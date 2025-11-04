<script setup>
import { defineProps, defineEmits } from "vue";
const props = defineProps(["btn", "modal"]);
const emit = defineEmits(["click:clk"]);
</script>

<template>
  <button
    class="login_button"
    @click="emit('click:clk', $event) ? emit('click:clk', $event) : null"
    :data-bs-toggle="props.modal ? props.modal['data-bs-toggle'] : null"
    :data-bs-target="props.modal ? '#' + props.modal['data-bs-target'] : null"
  >
    {{ props.btn.text }}
  </button>
</template>

<style>
.login_button {
  background-color: black;
  border: 1px solid;
  border-radius: 10px;
  color: white;
  margin: 10px;
  width: 100%;
}
</style>
