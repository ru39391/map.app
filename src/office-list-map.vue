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
          <LocationIcon class="map-location-toggler__icon" />
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
          placeholder="Район, улица..."
        />
        <div
          :class="[
            'map-sidebar__info map-sidebar__info_type_alert',
            { 'is-hidden': isAlertPanelVisible },
          ]"
          v-if="
            !isPointsListVisible &&
            !isCategoryListLoading &&
            isMapVisible &&
            customItemsList.length === 0
          "
        >
          <div class="map-sidebar__desc">{{ captionsData.noItemsCap }}</div>
        </div>
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
              href="#"
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
      <div
        v-if="!isCategoryListLoading"
        :class="['map-sidebar__wrapper', { 'is-hidden': isMapVisible }]"
      >
        <div
          :class="[
            'map-sidebar__list map__custom-scrollbar',
            { 'is-hidden': selectedItemsList.length },
          ]"
        >
          <div
            class="map-sidebar__link map-sidebar__link_fs_sm map-sidebar__link_td_none"
            v-if="
              !isPointsListVisible &&
              !isCategoryListLoading &&
              customItemsList.length === 0
            "
          >
            {{ captionsData.noItemsCap }}
          </div>
          <InfoCard
            v-for="(item, index) in cardsList"
            :key="item.id"
            :ref="`card-${item.id}`"
            :id="`card-${item.id}`"
            :item="item"
            :index="index"
            :currentCategory="currentCategory"
          />
          <button
            v-if="isCardsListBtnVisible"
            class="map-sidebar__link map-sidebar__link_type_btn"
            type="button"
            @click="expandCardsList(customItemsList)"
          >
            Показать ещё
          </button>
        </div>
        <div
          :class="[
            'map-sidebar__list map__custom-scrollbar',
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
              captionsData.itemsListCap
            }}</template>
            <template v-else>{{ captionsData.selItemsCap }}</template>
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
  COORDS_KEY,
  DEFAULT_LOC,
  FILIAL_KEY,
  ATM_KEY,
  TERMINAL_KEY,
  ASSETS_URL,
  CARDS_LIST_LENGTH,
} from "./utils/constants";
import { handleLocationData } from "./utils";
import { useCategoryStore } from "./store/modules/category";
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
import yMapHandler from "./utils/ymap-handler";

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
      cardsList: [],
      cardsListLength: CARDS_LIST_LENGTH,
      isMapVisible: true,
      isFilterVisible: false,
      isAdsPanelVisible: true,
      isAlertPanelVisible: true,
    };
  },

  computed: {
    ...mapState(useCategoryStore, [
      "isCategoryListLoading",
      "currentItemsList",
      "customItemsList",
      "selectedItemsList",
    ]),

    ...mapState(useFilterStore, [
      "locationList",
      "currentLocation",
      "categoryList",
      "currentCategory",
      "currentFilterData",
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

    isPointsListVisible() {
      return this.currentCategory && this.currentCategory.type === POINT_KEY;
    },

    qrCodeUrl() {
      return `${ASSETS_URL}/qr.png`;
    },

    itemsList() {
      return this.selectedItemsList.length
        ? [...this.selectedItemsList]
        : [...this.customItemsList];
    },

    captionsData() {
      const data = {
        [FILIAL_KEY]: "Отделений",
        [ATM_KEY]: "Банкоматов",
        [POINT_KEY]: "Точек погашения кредита",
        [TERMINAL_KEY]: "Терминалов",
      };

      return {
        itemsListCap: `К списку ${data[this.currentCategoryKey].toLowerCase()}`,
        noItemsCap: `Рядом нет подходящих ${data[
          this.currentCategoryKey
        ].toLowerCase()}`,
        selItemsCap: `${data[this.currentCategoryKey]} по этому адресу: ${
          this.selectedItemsList.length
        }`,
      };
    },

    isCardsListBtnVisible() {
      return (
        this.customItemsList.length > this.cardsList.length &&
        this.customItemsList.length > this.cardsListLength
      );
    },
  },

  methods: {
    ...mapActions(useCategoryStore, [
      "fetchCategoryData",
      "fetchPointsData",
      "setSelectedItemsList",
    ]),

    ...mapActions(useFilterStore, [
      "initFilter",
      "setLocationList",
      "setCurrentLocation",
    ]),

    ...mapActions(useModalStore, ["setModalOpen"]),

    handleCurrLocation(data) {
      this.setModalOpen(false);

      if (
        this.currentLocation &&
        data[LOCATION_CODE_KEY] !== this.currentLocation[LOCATION_CODE_KEY]
      ) {
        this.setCurrentLocation(data);
      }
    },

    async handlePointsData(payload) {
      const { data } = payload;

      try {
        const { isSucceed, data: locationData } = await handleLocationData({
          value: payload[LOCATION_KEY],
          code: payload[LOCATION_CODE_KEY],
        });

        if (isSucceed && data) {
          const pointsData = Object.values(data).reduce(
            (acc, item, index) => ({
              ...acc,
              [Object.keys(data)[index]]: {
                ...item,
                boundedBy: locationData.boundedBy,
              },
            }),
            {}
          );

          this.fetchPointsData(pointsData);
        } else {
          this.fetchPointsData({});
        }
      } catch (error) {
        console.error(error);
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

    hideAlert() {
      setTimeout(() => {
        this.isAlertPanelVisible = true;
      }, 3000);
    },

    setCardsList(arr) {
      this.cardsList = arr.filter((_, index) => index < this.cardsListLength);
    },

    expandCardsList(arr) {
      if (this.cardsList.length === arr.length) {
        return;
      }

      const items = arr.filter((_, index) => index >= this.cardsList.length);

      this.cardsList = [
        ...this.cardsList,
        ...items.filter((_, index) => index < this.cardsListLength),
      ];
    },

    handleUpdatedLocation(data, prevData) {
      if (!prevData) {
        this.fetchCategoryData(data, data.params || "");
        return;
      }

      const values = Object.keys(data).reduce(
        (acc, key) =>
          data[key] === prevData[key] ? acc : { ...acc, [key]: data[key] },
        {}
      );
      const isParamsDataExcluded =
        Object.keys(values).length === 3 &&
        Object.keys(values).filter((key) =>
          [LOCATION_KEY, LOCATION_CODE_KEY, COORDS_KEY].includes(key)
        ).length === 3;

      if (isParamsDataExcluded) {
        yMapHandler.setUpdMapCenter(values);
      } else {
        this.fetchCategoryData(data, data.params || "");
      }
    },
  },

  watch: {
    currentItemsList(arr) {
      console.log("Cписок карточек обновлён", arr);
      this.setSelectedItemsList();
    },

    currentFilterData(data, prevData) {
      console.log("Параметры фильтра обновлены", data);
      if (data && data.type === POINT_KEY) {
        this.handlePointsData(data);
      } else {
        this.handleUpdatedLocation(data, prevData);
      }
    },

    isPointsListVisible(value) {
      if (value) this.isMapVisible = value;
    },

    customItemsList(arr) {
      console.log({ customItemsList: arr.length });
      this.setCardsList(arr);
      yMapHandler.handleCardsList(arr);
    },

    cardsList(arr) {
      console.log({ cardsList: arr.length });
    },
  },

  beforeMount() {
    this.initFilter();
    this.setLocationList();
  },
};
</script>
