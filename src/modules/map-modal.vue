<template>
  <div
    class="map-overlay map-overlay_type_holder"
    v-if="isModalOpen"
    @click.self="setModalOpen(false)"
  >
    <div :class="['map-modal', { 'is-active': isModalOpen }]">
      <button
        class="map-modal__close"
        type="button"
        @click="setModalOpen(false)"
      >
        <CloseIcon />
      </button>
      <div class="map-modal__header">
        <div class="map-modal__title" v-if="modalTitle">{{ modalTitle }}</div>
        <slot name="header"></slot>
      </div>
      <div class="map-modal__wrapper" v-if="$slots.wrapper">
        <div class="map-modal__subtitle" v-if="modalSubtitle">
          {{ modalSubtitle }}
        </div>
        <slot name="wrapper"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useModalStore } from "../store/modules/modal";
import CloseIcon from "../assets/icons/close-icon.vue";

export default defineComponent({
  name: "MapModal",

  components: {
    CloseIcon,
  },

  props: {
    modalTitle: {
      type: String,
    },
    modalSubtitle: {
      type: String,
    },
  },

  setup() {
    const modalStore = useModalStore();
    const isModalOpen = computed(() => modalStore.isModalOpen);

    return {
      isModalOpen,
      setModalOpen: modalStore.setModalOpen,
    }
  },
});
</script>
