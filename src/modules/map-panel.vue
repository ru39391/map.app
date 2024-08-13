<template>
  <div
    class="map-overlay map-overlay_type_holder map-overlay_type_panel is-mobile-only"
    v-if="selectedItemsList.length"
    @click.self="setSelectedItemsList([])"
  >
    <div
      :class="[
        'map-modal map-modal_type_panel is-active',
        { 'is-hidden': !selectedItemsList.length },
      ]"
      @touchstart.self="handleTouchStart"
      @touchmove.self="handleTouchMove"
    >
      <div class="map-modal__header">
        <button
          class="map-modal__close map-modal__close_mb_none"
          type="button"
          @click="setSelectedItemsList([])"
        >
          <CloseIcon />
        </button>
      </div>
      <div class="map-modal__wrapper map-modal__wrapper_type_column">
        <InfoCard
          v-for="item in selectedItemsList"
          :key="item.id"
          :item="item"
          :currentCategory="currentCategory"
          :isCardFooterVisible="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useCategoryStore } from "../store/modules/category";
import InfoCard from "./info-card.vue";
import CloseIcon from "../assets/icons/close-icon.vue";

export default {
  name: "map-panel",

  components: {
    InfoCard,
    CloseIcon,
  },

  data() {
    return {
      startY: 0,
      isModalHeightMax: false,
    };
  },

  computed: {
    ...mapState(useCategoryStore, ["selectedItemsList", "currentCategory"]),
  },

  methods: {
    ...mapActions(useCategoryStore, ["setSelectedItemsList"]),

    setModalHeightMax(value) {
      this.isModalHeightMax = value;
    },

    handleTouchStart(event) {
      this.startY = event.touches[0].clientY;
    },

    handleTouchMove(event) {
      const currentY = event.touches[0].clientY;

      this.setModalHeightMax(this.startY - currentY > 20);
    },
  },

  watch: {
    selectedItemsList(arr) {
      console.log("Подробные данные обновлены", arr);
      if (!arr.length) this.setModalHeightMax(Boolean(arr.length));
    },
  },
};
</script>
