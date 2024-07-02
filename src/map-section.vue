<template>
  <div class="map-section">
    <YandexMap
      :coordinates="currentCoords"
      :controls="[]"
      v-if="!isCategoryListLoading"
      class="map-section__container"
      zoom="13"
    >
      <YandexMarker
        v-for="item in mapMarkersList"
        :key="item.id"
        :marker-id="item.id"
        :coordinates="item.coords"
        :options="{...markerOptions, ...markerIcons[item.key]}"
        @click="scrollToItemCard(item)"
      />
    </YandexMap>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { YandexMap, YandexMarker } from 'vue-yandex-maps';
  import { POINT_KEY, BEELINE_KEY, MTS_KEY, KH_KEY, KARI_KEY, LXNET_KEY, RUPOST_KEY, DEFAULT_COORDS } from './utils/constants';
  import { useCategoryStore } from './store/modules/category';
  import { useLocationStore } from './store/modules/location';

  export default {
    name: 'map-section',

    components: {
      YandexMap,
      YandexMarker
    },

    data() {
      return {
        mapMarkersList: [],
        markerIconSizes: {
          iconImageSize: [36, 36],
          iconImageOffset: [-18, -36]
        },
        markerIcons: {
          default: {
            iconImageHref: './src/assets/map-icons/pin-icon.svg',
            iconImageSize: [50, 72],
            iconImageOffset: [-25, -72]
          },
          [BEELINE_KEY]: {
            iconImageHref: './src/assets/map-icons/beeline-icon.png',
          },
          [MTS_KEY]: {
            iconImageHref: './src/assets/map-icons/mts-icon.png',
          },
          [KH_KEY]: {
            iconImageHref: './src/assets/map-icons/kh-icon.png',
          },
          [KARI_KEY]: {
            iconImageHref: './src/assets/map-icons/kari-icon.png',
          },
          [LXNET_KEY]: {
            iconImageHref: './src/assets/map-icons/lxnet-icon.png',
          },
          [RUPOST_KEY]: {
            iconImageHref: './src/assets/map-icons/rupost-icon.png',
          },
        }
      };
    },

    computed: {
      ...mapState(
        useCategoryStore,
        [
          'isCategoryListLoading',
          'itemsList',
          'currentItemsList',
          'currentCategory'
        ]
      ),

      ...mapState(useLocationStore, ['currentLocation']),

      currentCoords() {
        return this.currentLocation ? this.currentLocation.coords : DEFAULT_COORDS;
      },

      isPointsListVisible() {
        return this.currentCategory && this.currentCategory.type === POINT_KEY;
      },

      markerOptions() {
        return {
          iconLayout: 'default#image',
          ...(this.isPointsListVisible ? { ...this.markerIconSizes } : { ...this.markerIcons.default })
        }
      }
    },

    methods: {
      setMapMarkersList(arr) {
        this.mapMarkersList = this.isPointsListVisible
          ? arr
          : arr.map(({ id, lon, lat }) => ({ id, coords: [Number(lon), Number(lat)] }));
      },

      scrollToItemCard(data) {
        console.log('Данные объекта карты', data);
        const item = document.querySelector(`#card-${data.id}`);

        item.scrollIntoView({ behavior: 'smooth' });
      }
    },

    watch: {
      currentItemsList(arr) {
        this.setMapMarkersList(arr);
      },

      currentCategory(data) {
        console.log('Категория обновлена, map', data);
        this.mapMarkersList = [];
      },

      mapMarkersList(arr) {
        console.log('Список объектов карты обновлён', arr);
      }
    }
  };
</script>
