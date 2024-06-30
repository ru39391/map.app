<template>
  <div id="map" :class="['map-section', { 'is-hidden': !isMapVisible }]">
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
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { loadYmap, YandexMap, YandexMarker } from 'vue-yandex-maps';
  import { DEFAULT_COORDS } from './utils/constants';
  import { useCategoryStore } from './store/modules/category';
  import { useLocationStore } from './store/modules/location';
  import PinIcon from './assets/icons/pin-icon.vue';

  export default {
    name: 'map-section',

    components: {
      YandexMap,
      YandexMarker,
      PinIcon
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

    props: {
      isMapVisible: {
        type: Boolean,
        required: true
      }
    },

    computed: {
      ...mapState(useCategoryStore, ['currentItemsList']),

      ...mapState(useLocationStore, ['currentLocation']),

      currentCoords() {
        return this.currentLocation ? this.currentLocation.coords : DEFAULT_COORDS;
      },

      mapMarkersList() {
        return this.currentItemsList.map(({ id, lon, lat }) => ({ id, coords: [Number(lon), Number(lat)] }));
      },
    },

    methods: {
      scrollToItemCard(id) {
        const item = document.querySelector(`#card-${id}`);

        item.scrollIntoView({ behavior: 'smooth' });
      }
    },
  };
</script>
