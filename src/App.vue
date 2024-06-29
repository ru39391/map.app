<template>
  <div class="map-wrapper h-100">
    <div class="map-sidebar">
      <div class="map-sidebar__header">
        <button class="map-location-toggler" type="button" @click="setModalOpen(true)">
          <LocationIcon />
          <span class="map-location-toggler__caption">{{ currLocationCaption }}</span>
        </button>
        <div class="map-filter-holder">
          <MapSelecter />
        </div>
      </div>
    </div>
    <MapModal
      modalTitle="Где будем искать?"
      modalSubtitle="Популярные города"
    >
      <template #header>
        <MapSearch
          :arr="locationList"
          param="location"
          noResultMess="В этом городе еще нет отделения"
        />
      </template>
      <template #wrapper>
        <div class="btn-list">
          <button
            v-for="(locationItem, index) in currLocationList"
            :key="index"
            :class="['btn-list__item', { 'is-active': locationItem === currLocationCaption }]"
            type="button"
            @click="handleCurrLocation(locationItem)"
          >
            {{ locationItem }}
          </button>
        </div>
      </template>
    </MapModal>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { FILIAL_KEY } from './utils/constants';
  import { useCategoryStore } from './store/modules/category';
  import { useLocationStore } from './store/modules/location';
  import { useModalStore } from './store/modules/modal';
  import LocationIcon from './assets/icons/location-icon.vue';
  import MapModal from './map-modal.vue';
  import MapSearch from './map-search.vue';
  import MapSelecter from './map-selecter.vue';

  export default {
    components: {
      LocationIcon,
      MapModal,
      MapSearch,
      MapSelecter
    },

    computed: {
      ...mapState(
        useCategoryStore,
        [
          'itemsList',
          'categoryList'
        ]
      ),

      ...mapState(
        useLocationStore,
        [
          'locationList',
          'currentLocation'
        ]
      ),

      currLocationCaption() {
        return this.currentLocation ? this.currentLocation.location : 'Москва';
      },

      currLocationList() {
        return this.locationList.reduce((acc, { location }, index) => index < 6 ? [...acc, location] : acc, []);
      }
    },

    methods: {
      ...mapActions(
        useCategoryStore,
        [
          'fetchCategoryData',
          'setCurrentCategory'
        ]
      ),

      ...mapActions(
        useLocationStore,
        [
          'setLocationList',
          'setCurrentLocation'
        ]
      ),

      ...mapActions(
        useModalStore,
        [
          'setModalOpen'
        ]
      ),

      handleCurrLocation(value) {
        this.setCurrentLocation(value);
      }
    },

    watch: {
      itemsList(arr) {
        this.setLocationList(arr);
      },
      currentLocation(data) {
        console.log(data);
      }
    },

    beforeMount() {
      this.fetchCategoryData(FILIAL_KEY);
      this.setCurrentCategory(this.categoryList[0]);
      this.setCurrentLocation();
    }
  }
</script>
