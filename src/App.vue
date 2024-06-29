<template>
  <div class="map-wrapper h-100">
    <div class="map-sidebar">
      <div className="map-sidebar__header">
        <button className="map-location-toggler" type="button" @click="setModalOpen(true)">
          <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M17.7347 1.88437C17.9866 1.78 18.2765 1.83764 18.4693 2.03041C18.662 2.22318 18.7197 2.5131 18.6153 2.76494L11.9868 18.7508C11.8731 19.0247 11.5938 19.192 11.2987 19.1631C11.0036 19.1342 10.762 18.9158 10.7037 18.625L9.23188 11.2678L1.87464 9.796C1.58393 9.73765 1.36551 9.49613 1.33658 9.20103C1.30765 8.90593 1.475 8.62659 1.74885 8.51289L17.7347 1.88437Z" stroke="#242424" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span className="map-location-toggler__caption">{{ currLocationCaption }}</span>
        </button>
        <div class="map-filter-holder">
          <MapSelecter />
        </div>
      </div>
    </div>
    <MapModal
      modalTitle="Где будем искать?"
    >
      <template #header>
      </template>
      <template #wrapper>
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
  import MapModal from './map-modal.vue';
  import MapSelecter from './map-selecter.vue';

  export default {
    components: {
      MapModal,
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
          'currentLocation'
        ]
      ),

      currLocationCaption() {
        return this.currentLocation ? this.currentLocation.location : 'Москва';
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
