<template>
  <div :class="['map-section', { 'is-hidden': !isMapVisible }]">
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
  import { YandexMap, YandexMarker } from 'vue-yandex-maps';
  import { POINT_KEY, DEFAULT_COORDS } from './utils/constants';
  import { useCategoryStore } from './store/modules/category';
  import { useLocationStore } from './store/modules/location';

  export default {
    name: 'map-section',

    components: {
      YandexMap,
      YandexMarker
    },

    props: {
      isMapVisible: {
        type: Boolean
      }
    },

    data() {
      return {
        mapMarkersList: [],
        markerOptions: {
          iconLayout: 'default#image',
          iconImageHref: './src/assets/map-icons/pin-icon.svg',
          iconImageSize: [50, 72],
          iconImageOffset: [-25, -72]
        }
      };
    },

    computed: {
      ...mapState(useCategoryStore, ['currentItemsList', 'currentCategory']),

      ...mapState(useLocationStore, ['currentLocation']),

      currentCoords() {
        return this.currentLocation ? this.currentLocation.coords : DEFAULT_COORDS;
      },
    },

    methods: {
      setMapMarkersList(arr) {
        this.mapMarkersList = this.currentCategory && this.currentCategory === POINT_KEY
          ? arr
          : arr.map(({ id, lon, lat }) => ({ id, coords: [Number(lon), Number(lat)] }));
      },

      scrollToItemCard(id) {
        const item = document.querySelector(`#card-${id}`);

        item.scrollIntoView({ behavior: 'smooth' });
      }
    },

    watch: {
      currentItemsList(arr) {
        this.setMapMarkersList(arr);
      },

      mapMarkersList(points) {
        console.log({points});
      }
    }
  };
</script>
