<script setup>
import { defineProps, defineEmits } from "vue";
const props = defineProps(["firmwareList", "firmware"]);
const emit = defineEmits(["change:chg"]);
</script>
<template>
  <div class="table-row">
    <table class="table-main table table-striped-columns table-hover">
      <thead>
        <tr>
          <th scope="col">chip id</th>
          <th scope="col">ip</th>
          <th scope="col">upload firmware</th>
          <th scope="col">status</th>
          <th scope="col">last upload time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in props.firmware" :key="index">
          <td scope="row">{{ item["chip id"] }}</td>
          <td>{{ item["ip"] }}</td>
          <td>
            <select @change="emit('change:chg', $event, index)">
              <option
                v-for="(selectItem, selectIndex) in props.firmwareList"
                :key="selectIndex"
                :value="selectItem.file_name"
                :selected="selectItem.file_name == item['upload firmware']"
              >
                {{ selectItem.file_name }}
              </option>
            </select>
          </td>
          <td>{{ item["status"] }}</td>
          <td>{{ item["last upload time"] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.table-main {
  border: 1px solid black;
  border-radius: 5px;
}
.table-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

td,
th {
  padding: 4px;
}

td,
table,
th,
td {
  border: 1px solid black;
  border-collapse: collapse;
}
</style>
