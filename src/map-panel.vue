<template>
  <div class="map-overlay map-overlay_type_holder">
    <div class="map-modal is-active">
      <button class="map-modal__close" type="button"><CloseIcon /></button>

    </div>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { useCategoryStore } from './store/modules/category';
  import CloseIcon from './assets/icons/close-icon.vue';

  export default {
    name: 'map-panel',

    components: {
      CloseIcon
    },

    data() {
      return {
      }
    },

    computed: {
    },

    methods: {
    }
  };
</script>
