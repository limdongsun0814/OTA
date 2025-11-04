<template>
  <NotFound />
</template>

<script>
import { defineComponent } from "vue";

// Components
import NotFound from "../components/NotFound.vue";

export default defineComponent({
  name: "NotFoundView",

  components: {
    NotFound,
  },
});
</script>
