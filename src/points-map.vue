<template>
  <YandexMap
    :coordinates="currentCoords"
    :controls="[]"
    class="map-section__container"
    zoom="13"
  >
    <YandexMarker
      v-for="item in mapMarkersList"
      :key="item.id"
      :marker-id="item.id"
      :coordinates="item.coords"
      :options="markerOptions"
      @click="scrollToItemCard(item.id)"
    />
  </YandexMap>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { YandexMap, YandexMarker } from 'vue-yandex-maps';
  import { DEFAULT_COORDS } from './utils/constants';
  import { useCategoryStore } from './store/modules/category';
  import { useLocationStore } from './store/modules/location';

  export default {
    name: 'points-map',

    components: {
      YandexMap,
      YandexMarker
    },

    data() {
      return {
        markerOptions: {
          iconLayout: 'default#image',
          iconImageHref: './src/assets/map-icons/pin-icon.svg',
          iconImageSize: [50, 72],
          iconImageOffset: [-25, -72]
        }
      };
    },

    computed: {
      ...mapState(useLocationStore, ['currentLocation']),

      currentCoords() {
        return this.currentLocation ? this.currentLocation.coords : DEFAULT_COORDS;
      },

      mapMarkersList() {
        return [];
      },
    },
  };
</script>
