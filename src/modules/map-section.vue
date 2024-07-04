<template>
  <div id="map" class="map-section">
    <!--
    <YandexMap
      :coordinates="currentCoords"
      :bounds="currentLocation.boundedBy"
      :controls="['zoomControl', 'geolocationControl']"
      zoom="11"
      v-if="!isCategoryListLoading && currentCoords.length"
      class="map-section__container"
    >
      <YandexMarker
        v-for="item in mapMarkersList"
        :key="item.id"
        :marker-id="item.id"
        :ref="`marker-${item.id}`"
        :coordinates="item.coords"
        :options="{...markerOptions, ...markerIcons[item.key]}"
        @mouseover="console.log(item.id)"
        @click="scrollToItemCard(item)"
      />
    </YandexMap>
    -->
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  //import { YandexMap, YandexMarker } from 'vue-yandex-maps';
  import { POINT_KEY, BEELINE_KEY, MTS_KEY, KH_KEY, KARI_KEY, LXNET_KEY, RUPOST_KEY, DEFAULT_COORDS, DEFAULT_BOUNDS } from '../utils/constants';
  import { useCategoryStore } from '../store/modules/category';
  import { useLocationStore } from '../store/modules/location';
  import yMapHandler from '../utils/ymap-handler';

  export default {
    name: 'map-section',

    components: {
      //YandexMap,
      //YandexMarker
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
          'currentCategory',
          'setCurrentItem'
        ]
      ),

      ...mapState(useLocationStore, ['currentLocation', 'currentCoords']),

      currLocationData() {
        return {
          coords: this.currentLocation ? this.currentLocation.coords : DEFAULT_COORDS,
          bounds: this.currentLocation ? this.currentLocation.boundedBy : DEFAULT_BOUNDS,
        };
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
        //console.log(this.$refs[`marker-${data.id}`]);
        console.log('Данные объекта карты', data);
        const target = document.querySelector(`#card-${data.id}`);
        const item = this.currentItemsList.find(({ id }) => id === data.id);

        target.scrollIntoView({ behavior: 'smooth' });
        this.setCurrentItem(item ? { ...item, coords: data.coords } : null);
      },

      onMouseEnter(id) {
        console.log(this.$refs[`marker-${id}`]);
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
        yMapHandler.renderYMap({ arr, ...this.currLocationData });
      },

      currentLocation(data) {
        console.log('Геопозиция обновлена, map', data);
      },
    },
  };
</script>
