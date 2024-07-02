<template>
  <button
    class="map-switcher"
    type="button"
    @click="this.$emit('handleMapVisibility')"
  >
    <template v-if="isMapVisible">
      Список
      <ListIcon />
    </template>
    <template v-else>
      Карта
      <MapIcon />
    </template>
  </button>
</template>

<script>
  import ListIcon from '../assets/icons/list-icon.vue';
  import MapIcon from '../assets/icons/map-icon.vue';

  export default {
    name: 'map-switcher',

    components: {
      ListIcon,
      MapIcon,
    },

    props: {
      isMapVisible: {
        type: Boolean,
        required: true
      }
    },
  };
</script>
