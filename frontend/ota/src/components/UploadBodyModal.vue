<script setup>
import { defineEmits } from "vue";
const emit = defineEmits(["change:chg"]);
</script>

<template>
  <div class="mb-3">
    <input
      class="form-control"
      type="file"
      id="formFile"
      @change="emit('change:chg', $event)"
    />
  </div>
</template>
