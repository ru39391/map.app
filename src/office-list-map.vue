<template>
  <div class="map-wrapper h-100">
    <MapSection />
    <div
      :class="[
        'map-sidebar',
        { 'is-active': !isMapVisible && !isFilterVisible },
        { 'is-fixed': !isMapVisible && isFilterVisible },
        { 'map-sidebar_type_filter': isPointsListVisible && isFilterVisible },
      ]"
    >
      <div class="map-sidebar__header">
        <button
          class="map-location-toggler"
          type="button"
          @click="setModalOpen(true)"
        >
          <LocationIcon />
          <span class="map-location-toggler__caption">{{
            currLocationCaption
          }}</span>
        </button>
        <div
          :class="[
            'map-filter-holder',
            { 'is-active': isPointsListVisible && isFilterVisible },
          ]"
        >
          <MapSelecter />
          <MapFilter @handleFilterVisibility="setFilterVisible" />
        </div>
        <MapSearch
          :arr="itemsList"
          :class="[{ 'is-hidden': isPointsListVisible && isFilterVisible }]"
          param="address"
          placeholder="Город, район, улица..."
        />
      </div>
      <div
        :class="['map-sidebar__section', { 'is-active': isAdsPanelVisible }]"
        v-if="isPointsListVisible"
      >
        <div class="map-sidebar__info">
          <img class="map-sidebar__qr" :src="qrCodeUrl" alt="" />
          <div class="map-sidebar__desc">
            Внести платеж или погасить кредит можно в
            <a
              class="map-sidebar__link"
              href="https://redirect.appmetrica.yandex.com/serve/605327523684878235"
              target="_blank"
            >
              нашем приложении
            </a>
          </div>
          <button
            class="map-sidebar__info-close"
            type="button"
            @click="setAdsPanelVisible(false)"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
      <div :class="['map-sidebar__wrapper', { 'is-hidden': isMapVisible }]">
        <div
          class="map__custom-scrollbar"
          :class="[
            'map-sidebar__list',
            { 'is-hidden': selectedItemsList.length },
          ]"
        >
          <InfoCard
            v-for="item in currentItemsList"
            :key="item.id"
            :ref="`card-${item.id}`"
            :id="`card-${item.id}`"
            :item="item"
            :currentCategory="currentCategory"
          />
        </div>
        <div
          class="map-sidebar__custom-scrollbar"
          :class="[
            'map-sidebar__list',
            { 'is-hidden': !selectedItemsList.length },
          ]"
        >
          <button
            class="map-sidebar__link map-sidebar__link_type_btn"
            type="button"
            @click="setSelectedItemsList()"
          >
            <ChevronRightIcon />
            <template v-if="selectedItemsList.length === 1">{{
              itemsListCaption
            }}</template>
            <template v-else>{{ itemsListCounter }}</template>
          </button>
          <InfoCard
            v-for="item in selectedItemsList"
            :key="item.id"
            :ref="`card-${item.id}`"
            :id="`card-${item.id}`"
            :item="item"
            :currentCategory="currentCategory"
          />
        </div>
      </div>
    </div>
    <MapModal modalTitle="Где будем искать?" modalSubtitle="Популярные города">
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
            :class="[
              'btn-list__item',
              {
                'is-active':
                  locationItem.locationCode === currentLocation.locationCode,
              },
            ]"
            type="button"
            @click="handleCurrLocation(locationItem)"
          >
            {{ locationItem.location }}
          </button>
        </div>
      </template>
    </MapModal>
    <MapSwitcher
      v-if="!isPointsListVisible"
      :class="[{ 'is-filter-visible': isFilterVisible }]"
      :isMapVisible="isMapVisible"
      @handleMapVisibility="setMapVisible"
    />
    <MapPanel />
    <div class="map-overlay" v-if="isCategoryListLoading">
      <LoaderIcon class="map-preloader" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import {
  POINT_KEY,
  LOCATION_KEY,
  LOCATION_CODE_KEY,
  DEFAULT_LOC,
  DEFAULT_LOC_CODE,
  FILIAL_KEY,
  ATM_KEY,
  TERMINAL_KEY,
  FILTER_KEY,
  ASSETS_URL,
} from "./utils/constants";
import { useCategoryStore } from "./store/modules/category";
import { useLocationStore } from "./store/modules/location";
import { useFilterStore } from "./store/modules/filter";
import { useModalStore } from "./store/modules/modal";
import ChevronRightIcon from "./assets/icons/chevron-right-icon.vue";
import CloseIcon from "./assets/icons/close-icon.vue";
import LocationIcon from "./assets/icons/location-icon.vue";
import LoaderIcon from "./assets/icons/loader-icon.vue";
import InfoCard from "./modules/info-card.vue";
import MapFilter from "./modules/map-filter.vue";
import MapModal from "./modules/map-modal.vue";
import MapPanel from "./modules/map-panel.vue";
import MapSearch from "./modules/map-search.vue";
import MapSection from "./modules/map-section.vue";
import MapSelecter from "./modules/map-selecter.vue";
import MapSwitcher from "./modules/map-switcher.vue";

export default {
  name: "office-list-map",

  components: {
    ChevronRightIcon,
    CloseIcon,
    LocationIcon,
    LoaderIcon,
    InfoCard,
    MapFilter,
    MapModal,
    MapPanel,
    MapSearch,
    MapSection,
    MapSelecter,
    MapSwitcher,
  },

  data() {
    return {
      isMapVisible: true,
      isFilterVisible: false,
      isAdsPanelVisible: true,
    };
  },

  computed: {
    ...mapState(useCategoryStore, [
      "isCategoryListLoading",
      "currentItemsList",
      "selectedItemsList"
    ]),

    ...mapState(useFilterStore, [
        "locationList",
        "currentLocation",
        "categoryList",
        "currentCategory",
        "currentFilterData"
      ]),

    currLocationCaption() {
      return this.currentLocation
        ? this.currentLocation[LOCATION_KEY]
        : DEFAULT_LOC;
    },

    currLocationList() {
      return this.locationList.filter(({ isPopular }) => isPopular);
    },

    currentCategoryKey() {
      return this.currentCategory
        ? this.currentCategory.type
        : this.categoryList[0].type;
    },
    /*
    currentLocationData() {
      return {
        [LOCATION_CODE_KEY]: this.currentLocation
          ? this.currentLocation[LOCATION_CODE_KEY]
          : DEFAULT_LOC_CODE,
      };
    },
    */

    isPointsListVisible() {
      return this.currentCategory && this.currentCategory.type === POINT_KEY;
    },

    qrCodeUrl() {
      return `${ASSETS_URL}/qr.png`;
    },

    itemsList() {
      return this.selectedItemsList.length
        ? [...this.selectedItemsList]
        : [...this.currentItemsList];
    },

    itemsListCaption() {
      const data = {
        [FILIAL_KEY]: "отделений",
        [ATM_KEY]: "банкоматов",
        [POINT_KEY]: "точек погашения кредита",
        [TERMINAL_KEY]: "терминалов",
      };

      return `К списку ${data[this.currentCategoryKey]}`;
    },

    itemsListCounter() {
      const data = {
        [FILIAL_KEY]: "отделения",
        [ATM_KEY]: "банкомата",
        [POINT_KEY]: "точек погашения кредита",
        [TERMINAL_KEY]: "терминала",
      };

      return `${this.selectedItemsList.length} ${
        data[this.currentCategoryKey]
      } по этому адресу:`;
    },
  },

  methods: {
    ...mapActions(useCategoryStore, [
      "fetchCategoryData",
      "fetchPointsData",
      "setSelectedItemsList"
    ]),

    ...mapActions(useFilterStore, [
        "initFilter",
        "setLocationList",
        "setCurrentLocation"
      ]),

    ...mapActions(useModalStore, ["setModalOpen"]),

    handleCurrLocation(data) {
      this.setModalOpen(false);

      if (
        this.currentLocation &&
        data[LOCATION_CODE_KEY] !== this.currentLocation[LOCATION_CODE_KEY]
      ) {
        this.setCurrentLocation(data[LOCATION_CODE_KEY]);
      }
    },

    setMapVisible() {
      this.isMapVisible = !this.isMapVisible;
    },

    setFilterVisible(value) {
      this.isFilterVisible = value;
    },

    setAdsPanelVisible(value) {
      this.isAdsPanelVisible = value;
    },
  },

  watch: {
    /*
    currentCategory(data) {
      console.log("Категория обновлена", data);
      //this.setSelectedItemsList();
    },
    */

    currentItemsList(arr) {
      console.log("Cписок карточек обновлён", arr);
      this.setSelectedItemsList();
    },

    currentFilterData(data) {
      console.log('Параметры фильтра обновлены', data);
      if(data && data.type === POINT_KEY) {
        this.fetchPointsData(data.data || {});
      } else {
        this.fetchCategoryData(data, data.params || '');
      }
    },

    isPointsListVisible(value) {
      if (value) this.isMapVisible = value;
    },
  },

  beforeMount() {
    this.initFilter();
    this.setLocationList();
  },
};
</script>
