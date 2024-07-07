<template>
  <div id="map" class="map-section"></div>
</template>

<script>
  import { mapState } from 'pinia';
  import {
    POINT_KEY,
    DEFAULT_KEY,
    CLOSED_KEY,
    BEELINE_KEY,
    MTS_KEY,
    KH_KEY,
    KARI_KEY,
    LXNET_KEY,
    RUPOST_KEY,
    DEFAULT_COORDS,
    DEFAULT_BOUNDS,
    MAP_PINS
  } from '../utils/constants';
  import { useCategoryStore } from '../store/modules/category';
  import { useLocationStore } from '../store/modules/location';
  import yMapHandler from '../utils/ymap-handler';

  export default {
    name: 'map-section',

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
          'currentItemsList',
          'currentCategory'
        ]
      ),

      ...mapState(useLocationStore, ['currentLocation']),

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
      },
    },

    methods: {
      setMapMarkersList(arr) {
        this.mapMarkersList = this.isPointsListVisible
          ? arr
          : arr.map(({ id, lon, lat, workingStatus }) => ({ id, coords: [Number(lon), Number(lat)], isWork: workingStatus.isWork }));
      },
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
        console.log({ ...this.currLocationData, config: this.markerOptions, icons: this.markerIcons });
        yMapHandler.renderYMap({ arr, ...this.currLocationData, config: this.markerOptions, icons: this.markerIcons });
      },

      currentLocation(data) {
        console.log('Геопозиция обновлена, map', data);
      },
    },
  };
</script>
