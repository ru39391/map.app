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
  import { POINT_KEY, DEFAULT_KEY, CLOSED_KEY, BEELINE_KEY, MTS_KEY, KH_KEY, KARI_KEY, LXNET_KEY, RUPOST_KEY, DEFAULT_COORDS, DEFAULT_BOUNDS, MAP_PINS } from '../utils/constants';
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
          [DEFAULT_KEY]: {
            iconImageHref: MAP_PINS[DEFAULT_KEY],
            iconImageSize: [50, 72],
            iconImageOffset: [-25, -72]
          },
          [CLOSED_KEY]: {
            iconImageHref: MAP_PINS[CLOSED_KEY],
            iconImageSize: [50, 72],
            iconImageOffset: [-25, -72]
          },
          [BEELINE_KEY]: {
            iconImageHref: MAP_PINS[BEELINE_KEY],
          },
          [MTS_KEY]: {
            iconImageHref: MAP_PINS[MTS_KEY],
          },
          [KH_KEY]: {
            iconImageHref: MAP_PINS[KH_KEY],
          },
          [KARI_KEY]: {
            iconImageHref: MAP_PINS[KARI_KEY],
          },
          [LXNET_KEY]: {
            iconImageHref: MAP_PINS[LXNET_KEY],
          },
          [RUPOST_KEY]: {
            iconImageHref: MAP_PINS[RUPOST_KEY],
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
        const item = this.currentItemsList.find(({ id }) => id === data.id);

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
        yMapHandler.renderYMap({ arr, ...this.currLocationData, config: this.markerOptions, icons: this.markerIcons });
      },

      currentLocation(data) {
        console.log('Геопозиция обновлена, map', data);
      },
    },
  };
</script>
