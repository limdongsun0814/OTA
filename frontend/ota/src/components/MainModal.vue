<template>
  <slot name="openModal" :modal="modalInput"></slot>
  <div
    class="modal fade"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    ref="myModalRef"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">
            {{ props.modal.title }}
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body"><slot name="modalBody">...</slot></div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            취소
          </button>
          <button
            type="button"
            class="btn btn-dark"
            @click="emit('click:clk', $event)"
            data-bs-dismiss="modal"
          >
            업로드
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
const props = defineProps(["modal"]);
const emit = defineEmits(["click:clk"]);

const myModalRef = ref(null);

onMounted(() => {
  new Modal(myModalRef.value);
});
</script>
<script>
import { Modal } from "bootstrap";
import { onMounted, ref, defineComponent } from "vue";
export default defineComponent({
  data: () => ({
    modalInput: {
      "data-bs-target": "exampleModal",
      "data-bs-toggle": "modal",
    },
  }),
});
</script>
