<template>
  <div
    class="map-overlay map-overlay_type_holder map-overlay_type_panel is-mobile-only"
    v-if="currentItem"
    @click.self="setCurrentItem(null)"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
  >
    <div :class="['map-modal', { 'is-active': isModalHeightMax }, { 'is-hidden': !currentItem }]">
      <div class="map-modal__header">
        <button class="map-modal__close map-modal__close_mb_none" type="button" @click="setCurrentItem(null)"><CloseIcon /></button>
      </div>
      <div class="map-modal__wrapper">
        <InfoCard
          v-if="currentItem"
          :item="currentItem"
          :currentCategory="currentCategory"
          :isPointsListVisible="false"
          :isCardFooterVisible="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { useCategoryStore } from '../store/modules/category';
  import InfoCard from './info-card.vue';
  import CloseIcon from '../assets/icons/close-icon.vue';

  export default {
    name: 'map-panel',

    components: {
      InfoCard,
      CloseIcon
    },

    data() {
      return {
        startY: 0,
        isModalHeightMax: false
      };
    },

    computed: {
      ...mapState(useCategoryStore, ['currentItem', 'currentCategory'])
    },

    methods: {
      ...mapActions(useCategoryStore, ['setCurrentItem']),

      setModalHeightMax(value) {
        this.isModalHeightMax = value;
      },

      handleTouchStart(event) {
        this.startY = event.touches[0].clientY;
      },

      handleTouchMove(event) {
        const currentY = event.touches[0].clientY;

        this.setModalHeightMax(this.startY - currentY > 50);
      }
    },

    watch: {
      currentItem(data) {
        console.log('Подробные данные обновлены', data);
        if(!data) this.setModalHeightMax(Boolean(data));
      }
    }
  };
</script>
