<script setup>
import { defineProps, defineEmits } from "vue";
const props = defineProps(["label"]);
const emit = defineEmits(["update:data"]);
</script>
<template>
  <div class="label-row">
    <label :for="props.label.id">{{ props.label.text }}</label>
    <input
      class="label-input"
      :type="props.label.type"
      :id="props.label.id"
      :value="props.label.data"
      @input="emit('update:data', $event.target.value)"
    />
  </div>
</template>

<style>
.label-input {
  border: 1px solid black;
  border-radius: 5px;
}
.label-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
</style>
