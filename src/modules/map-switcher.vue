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

<script lang="ts">
import { defineComponent } from 'vue';
import ListIcon from "../assets/icons/list-icon.vue";
import MapIcon from "../assets/icons/map-icon.vue";

/**
 * Переключает отображение (карта или список) филиалов/банкоматов/терминалов на мобильных устройствах
 *
 * @component
 * @example
 * <MapSwitcher />
 */
export default defineComponent({
  name: "MapSwitcher",

  components: {
    ListIcon,
    MapIcon,
  },

  props: {
    isMapVisible: {
      type: Boolean,
      required: true,
    },
  },
});
</script>
