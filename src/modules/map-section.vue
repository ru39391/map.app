<template>
  <div id="map" class="map-section">
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
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { YandexMap, YandexMarker } from 'vue-yandex-maps';
  import { POINT_KEY, BEELINE_KEY, MTS_KEY, KH_KEY, KARI_KEY, LXNET_KEY, RUPOST_KEY, DEFAULT_COORDS } from '../utils/constants';
  import { useCategoryStore } from '../store/modules/category';
  import { useLocationStore } from '../store/modules/location';

  export default {
    name: 'map-section',

    components: {
      YandexMap,
      YandexMarker
    },

    data() {
      return {
        yMap: null,
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
      },

      destroyCurrMap(data) {
        if(data) {
          this.yMap.map.destroy();
          this.yMap.map = null;
        }

        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({
              isSucceed: true,
              message: 'Карта обновлена'
            })
          }, 200);
        });
      },

      async initMap(config) {
        let data = { isSucceed: false };
        console.log(config);

        try {
          const yMaps = await new Promise((resolve) => ymaps.ready(resolve));
          const map = new yMaps.Map('map', { ...config, zoom: 11, controls: [] });

          data = { isSucceed: Boolean(yMaps), yMaps };
          this.yMap = { map };
        } catch (error) {
          console.error(error);
        }

        return data;
      },

      async renderMap({ arr, coords, bounds }) {
        console.log(arr.length);
        try {
          const res = await Promise.all([this.destroyCurrMap(this.yMap), this.initMap({ center: coords, bounds })]);

          if(res.reduce((acc, { isSucceed }) => acc && isSucceed, true)) {
            console.log(res);
            const { yMaps } = res.reduce((acc, item) => {
              const key = Object.keys(item).find(key => key !== 'isSucceed');

              return { ...acc, [key]: item[key] };
            }, {});
            /*
            console.log({ yMaps });

            const collection = new yMaps.GeoObjectCollection(null, { preset: 'islands#blackDotIcon' });

            arr.forEach(({ id, coords }) => {
              //console.log({ id, coords });
              collection.add(new yMaps.Placemark(coords, { id }));
            });
            this.yMap.map.geoObjects.add(collection);
            */
          }
        } catch (error) {
          console.error(error);
        }
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
        //this.renderMap({ arr, coords: this.currentLocation.coords, bounds: this.currentLocation.boundedBy });
      },

      currentLocation(data) {
        console.log('Геопозиция обновлена, map', data);
        //if(data) this.renderMap({ arr: this.mapMarkersList, coords: data.coords, bounds: data.boundedBy });
      },

      yMap(yMap) {
        console.log({yMap});
      }
    },
  };
</script>
