<script setup>
import { defineProps, defineEmits } from "vue";
const props = defineProps(["unusedFirmware"]);
const emit = defineEmits(["change:chg"]);
</script>

<template>
  <div class="lable-table">
    <div
      class="form-check"
      v-for="(item, index) in props.unusedFirmware"
      :key="index"
    >
      <input
        class="form-check-input"
        type="checkbox"
        :value="index"
        :id="index"
        @change="emit('change:chg', $event, index)"
      />
      <label class="form-check-label" :for="index">
        {{ item.file_name }}
      </label>
    </div>
  </div>
</template>

<style>
.lable-table {
  display: flex;
  flex-direction: column;
}
.form-check {
  display: flex;
}
</style>
