<script setup>
import { defineProps, defineEmits } from "vue";
const props = defineProps(["btn"]);
const emit = defineEmits(["click:clk"]);
</script>

<template>
  <button class="login_button" @click="emit('click:clk', $event)">
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
}
</style>
