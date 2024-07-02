<template>
  <div class="map-wrapper h-100">
    <MapSection />
    <div
      :class="['map-sidebar', { 'is-active': !isMapVisible }]"
    >
      <div class="map-sidebar__header">
        <button class="map-location-toggler" type="button" @click="setModalOpen(true)">
          <LocationIcon />
          <span class="map-location-toggler__caption">{{ currLocationCaption }}</span>
        </button>
        <div class="map-filter-holder">
          <MapSelecter />
          <MapFilter />
        </div>
        <MapSearch
          :arr="currentItemsList"
          param="address"
          placeholder="Город, район, улица..."
        />
      </div>
      <div
        :class="['map-sidebar__wrapper', { 'is-hidden': isMapVisible }]"
      >
        <div className="map-sidebar__list">
          <InfoCardList />
        </div><!-- ref={itemsListRef} -->
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
          placeholder="Город"
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
  <div class="map-overlay" v-if="isCategoryListLoading"><LoaderIcon class="map-preloader" /></div>
  <button class="map-switcher" type="button" @click="setMapVisible">
    <template v-if="isMapVisible">
      Список
      <ListIcon />
    </template>
    <template v-else>
      Карта
      <MapIcon />
    </template>
  </button>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { LOCATION_KEY, DEFAULT_LOC } from './utils/constants';
  import { useCategoryStore } from './store/modules/category';
  import { useLocationStore } from './store/modules/location';
  import { useModalStore } from './store/modules/modal';
  import InfoCardList from './info-card-list.vue';
  import ListIcon from './assets/icons/list-icon.vue';
  import LocationIcon from './assets/icons/location-icon.vue';
  import LoaderIcon from './assets/icons/loader-icon.vue';
  import MapIcon from './assets/icons/map-icon.vue';
  import MapFilter from './map-filter.vue';
  import MapModal from './map-modal.vue';
  import MapSearch from './map-search.vue';
  import MapSection from './map-section.vue';
  import MapSelecter from './map-selecter.vue';

  export default {
    components: {
      InfoCardList,
      ListIcon,
      LocationIcon,
      LoaderIcon,
      MapIcon,
      MapFilter,
      MapModal,
      MapSearch,
      MapSection,
      MapSelecter
    },

    data() {
      return {
        isMapVisible: true
      };
    },

    computed: {
      ...mapState(
        useCategoryStore,
        [
          'isCategoryListLoading',
          'itemsList',
          'currentItemsList',
          'categoryList',
          'currentCategory'
        ]
      ),

      ...mapState(
        useLocationStore,
        ['locationList', 'currentLocation']
      ),

      currLocationCaption() {
        return this.currentLocation ? this.currentLocation[LOCATION_KEY] : DEFAULT_LOC;
      },

      currLocationList() {
        return this.locationList.reduce((acc, { location }, index) => index < 6 ? [...acc, location] : acc, []);
      },

      currentCategoryKey() {
        return this.currentCategory ? this.currentCategory.type : this.categoryList[0].type
      }
    },

    methods: {
      ...mapActions(
        useCategoryStore,
        [
          'fetchCategoryData',
          'setCurrentItemsList',
          'setCurrentCategory'
        ]
      ),

      ...mapActions(
        useLocationStore,
        ['setLocationList', 'setCurrentLocation']
      ),

      ...mapActions(useModalStore, ['setModalOpen']),

      handleCurrLocation(value) {
        this.setModalOpen(false);

        if(this.currentLocation && value !== this.currentLocation[LOCATION_KEY]) this.setCurrentLocation(value);
      },

      setMapVisible() {
        this.isMapVisible = !this.isMapVisible;
      }
    },

    watch: {
      currentLocation(data) {
        this.setCurrentItemsList({
          arr: this.itemsList,
          category: this.currentCategoryKey,
          [LOCATION_KEY]: data ? data[LOCATION_KEY] : DEFAULT_LOC
        });
      },
      itemsList(arr) {
        console.log('Получили и обработали данные', arr);
        this.setLocationList({
          arr,
          category: this.currentCategoryKey,
        });
        this.setCurrentItemsList({
          arr,
          category: this.currentCategoryKey,
          [LOCATION_KEY]: this.currentLocation ? this.currentLocation[LOCATION_KEY] : DEFAULT_LOC,
        });
      }
    },

    beforeMount() {
      this.fetchCategoryData(this.categoryList[0].type); // POINT_KEY
      this.setCurrentCategory(this.categoryList[0]); //[0]
      this.setCurrentLocation();
    },
  }
</script>
