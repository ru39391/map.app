<template>
  <div
    class="map-overlay map-overlay_type_holder is-mobile-only"
    v-if="currentItem"
    @click.self="setCurrentItem(null)"
  >
    <div class="map-modal is-active">
      <button class="map-modal__close" type="button" @click="setCurrentItem(null)"><CloseIcon /></button>
      <InfoCard
        v-if="currentItem"
        :item="currentItem"
        :currentCategory="currentCategory"
        :isPointsListVisible="false"
        :isCardFooterVisible="true"
      />
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

    computed: {
      ...mapState(useCategoryStore, ['currentItem', 'currentCategory'])
    },

    methods: {
      ...mapActions(useCategoryStore, ['setCurrentItem'])
    },

    watch: {
      currentItem(data) {
        console.log('Подробные данные обновлены', data);
      }
    }
  };
</script>
