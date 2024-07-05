<template>
  <div class="map-wrapper h-100">
    <MapSection />
    <div
      :class="[
        'map-sidebar',
        { 'is-active': !isMapVisible && !isFilterVisible },
        { 'is-fixed': !isMapVisible && isFilterVisible }
      ]"
    >
      <div class="map-sidebar__header">
        <button class="map-location-toggler" type="button" @click="setModalOpen(true)">
          <LocationIcon />
          <span class="map-location-toggler__caption">{{ currLocationCaption }}</span>
        </button>
        <div class="map-filter-holder">
          <MapSelecter />
          <MapFilter @handleFilterVisibility="setFilterVisible" />
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
        <div class="map-sidebar__list">
          <InfoCard
            v-for="item in currentItemsList"
            :key="item.id"
            :ref="`card-${item.id}`"
            :id="`card-${item.id}`"
            :item="item"
            :currentCategory="currentCategory"
            :isPointsListVisible="isPointsListVisible"
          />
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
    <MapSwitcher
      :isMapVisible="isMapVisible"
      @handleMapVisibility="setMapVisible"
    />
    <MapPanel />
    <div class="map-overlay" v-if="isCategoryListLoading"><LoaderIcon class="map-preloader" /></div>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { POINT_KEY, LOCATION_KEY, LOCATION_CODE_KEY, DEFAULT_LOC, DEFAULT_LOC_CODE, LOCATION_LIST } from './utils/constants';
  import { useCategoryStore } from './store/modules/category';
  import { useLocationStore } from './store/modules/location';
  import { useModalStore } from './store/modules/modal';
  import InfoCard from './modules/info-card.vue';
  import LocationIcon from './assets/icons/location-icon.vue';
  import LoaderIcon from './assets/icons/loader-icon.vue';
  import MapFilter from './modules/map-filter.vue';
  import MapModal from './modules/map-modal.vue';
  import MapPanel from './modules/map-panel.vue';
  import MapSearch from './modules/map-search.vue';
  import MapSection from './modules/map-section.vue';
  import MapSelecter from './modules/map-selecter.vue';
  import MapSwitcher from './modules/map-switcher.vue';

  export default {
    name: 'map-office-list',

    components: {
      InfoCard,
      LocationIcon,
      LoaderIcon,
      MapFilter,
      MapModal,
      MapPanel,
      MapSearch,
      MapSection,
      MapSelecter,
      MapSwitcher
    },

    data() {
      return {
        isMapVisible: true,
        isFilterVisible: false
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
        return [...LOCATION_LIST];
      },

      currentCategoryKey() {
        return this.currentCategory ? this.currentCategory.type : this.categoryList[0].type
      },

      isPointsListVisible() {
        return this.currentCategory && this.currentCategory.type === POINT_KEY;
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
      },

      setFilterVisible(value) {
        this.isFilterVisible = value;
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
        this.setCurrentItemsList({
          arr,
          category: this.currentCategoryKey,
          [LOCATION_KEY]: this.currentLocation ? this.currentLocation[LOCATION_KEY] : DEFAULT_LOC,
        });
      },

      currentItemsList(arr) {
        console.log('Cписок карточек обновлён', arr);
      },

      currentCategory(data) {
        console.log('Категория обновлена', data);
      },

      locationList(arr) {
        console.log('Список геолокаций обновлён', arr);
      }
    },

    beforeMount() {
      this.setLocationList(this.currentCategoryKey);
      /*
      this.fetchCategoryData({
        type: this.categoryList[0].type,
        [LOCATION_KEY]: this.currentLocation ? this.currentLocation[LOCATION_CODE_KEY] : DEFAULT_LOC_CODE,
      });
      */
      this.setCurrentCategory(this.categoryList[0]);
      this.setCurrentLocation();
    },
  }
</script>
