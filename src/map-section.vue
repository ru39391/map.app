<template>
  <div id="map" :class="['map-section', { 'is-hidden': !isMapVisible }]">
    <YandexMap
      :coordinates="currentCoords"
      :controls="[]"
      class="map-section__container"
      zoom="11"
    >
    </YandexMap>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { loadYmap, YandexMap } from 'vue-yandex-maps';
  import { useLocationStore } from './store/modules/location';

  export default {
    name: 'map-section',

    components: {
      YandexMap
    },

    data() {
      return {
      };
    },

    props: {
      isMapVisible: {
        type: Boolean,
        required: true
      }
    },

    computed: {
      ...mapState(
        useLocationStore,
        ['currentLocation']
      ),

      currentCoords() {
        return this.currentLocation ? this.currentLocation.coords : [];
      }
    },

    methods: {
      async initMap() {
        try {
          const res = await loadYmap();

          console.log(res);
        } catch (error) {
          console.log(error);
        }
      }
    },

    mounted() {
      this.initMap();
    },
  };
</script>
