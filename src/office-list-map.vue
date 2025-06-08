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
          <span class="map-location-toggler__caption">{{ currLocationCaption }}</span>
        </button>
        <div
          :class="[
            'map-filter-holder',
            { 'is-active': isPointsListVisible && isFilterVisible },
          ]"
        >
          <MapSelecter />
          <!--
          <MapFilter @handleFilterVisibility="setFilterVisible" />
          -->
        </div>
        <!--
        <MapSearch
          :arr="itemsList"
          :class="[{ 'is-hidden': isPointsListVisible && isFilterVisible }]"
          param="address"
          placeholder="Район, улица..."
        />
        -->
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
            <a class="map-sidebar__link" href="#" target="_blank">
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
            <template v-if="selectedItemsList.length === 1">{{ captionsData.itemsListCap }}</template>
            <template v-else>{{ captionsData.selItemsCap }}</template>
          </button>
          <!--
          <InfoCard
            v-for="item in selectedItemsList"
            :key="item.id"
            :ref="`card-${item.id}`"
            :id="`card-${item.id}`"
            :item="item"
            :currentCategory="currentCategory"
          />
          -->
        </div>
      </div>
    </div>
    <!--
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
    -->
    <MapSwitcher
      v-if="!isPointsListVisible"
      :class="[{ 'is-filter-visible': isFilterVisible }]"
      :isMapVisible="isMapVisible"
      @handleMapVisibility="setMapVisible"
    />
    <!--
    <MapPanel />
    -->
    <div class="map-overlay" v-if="isCategoryListLoading">
      <LoaderIcon class="map-preloader" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref, watch } from "vue";
import type {
  TFilterData,
  TItemData,
  TLocationData,
  TPointsFilterData
} from "./utils/types";
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

export default defineComponent({
  name: "OfficeListMap",

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

  setup() {
    const cardsList = ref<TItemData[]>([]);
    const cardsListLength = ref<number>(CARDS_LIST_LENGTH);
    const isMapVisible = ref<boolean>(true);
    const isFilterVisible = ref<boolean>(false);
    const isAdsPanelVisible = ref<boolean>(true);
    const isAlertPanelVisible = ref<boolean>(true);

    const modalStore = useModalStore();
    const categoryStore = useCategoryStore();
    const isCategoryListLoading = computed(() => categoryStore.isCategoryListLoading);
    /**
     * Основной список объектов
    */
    const currentItemsList = computed(() => categoryStore.currentItemsList);
    /**
     * Список объектов, соответствующий элементам в текущих границах карты
    */
    const customItemsList = computed(() => categoryStore.customItemsList);
    /**
     * Список выбранных по клику на пин карты объектов
    */
    const selectedItemsList = computed(() => categoryStore.selectedItemsList);

    const filterStore = useFilterStore();
    const categoryList = computed(() => filterStore.categoryList);
    const locationList = computed(() => filterStore.locationList);
    const currentCategory = computed(() => filterStore.currentCategory);
    const currentFilterData = computed(() => filterStore.currentFilterData);
    const currentLocation = computed(() => filterStore.currentLocation);

    const currLocationCaption = computed(() => currentLocation.value ? currentLocation.value[LOCATION_KEY] : DEFAULT_LOC);
    const currLocationList = computed(() => [...locationList.value].filter(({ isPopular }) => isPopular));
    const currentCategoryKey = computed(() => currentCategory.value ? currentCategory?.value.type : [...categoryList.value][0].type);
    const isPointsListVisible = computed(() => currentCategory.value && currentCategory?.value.type === POINT_KEY);

    const qrCodeUrl = computed(() => `${ASSETS_URL}/qr.png`);
    const itemsList = computed(() => selectedItemsList.value.length ? [...selectedItemsList.value] : [...customItemsList.value]);
    const captionsData = computed(() => {
      const data = {
        [FILIAL_KEY]: "Отделений",
        [ATM_KEY]: "Банкоматов",
        [POINT_KEY]: "Точек погашения кредита",
        [TERMINAL_KEY]: "Терминалов",
      };

      return {
        itemsListCap: `К списку ${data[currentCategoryKey.value].toLowerCase()}`,
        noItemsCap: `Рядом нет подходящих ${data[currentCategoryKey.value].toLowerCase()}`,
        selItemsCap: `${data[currentCategoryKey.value]} по этому адресу: ${selectedItemsList.value.length}`,
      };
    });
    const isCardsListBtnVisible = computed(
      () => customItemsList.value.length > cardsList.value.length && customItemsList.value.length > cardsListLength.value
    );

    /**
     * Обновляет геолокацию по клику на элемент списка неселённых пунктов
     * @property {TLocationData} data - данные выбранной геолокации
    */
    const handleCurrLocation = (data: TLocationData) => {
      modalStore.setModalOpen(false);

      if (currentLocation.value && data[LOCATION_CODE_KEY] !== currentLocation.value[LOCATION_CODE_KEY]) {
        filterStore.setCurrentLocation(data);
      }
    };

    /**
     * Формирует актуальный список точек погашения, используя данные фильтра
     * @property {TFilterData} payload - обновлённые данные фильтра
    */
    const handlePointsData = async (payload: TFilterData) => {
      const { data }: { data: TPointsFilterData | null; } = payload;

      try {
        const { isSucceed, data: locationData } = await handleLocationData({
          value: payload[LOCATION_KEY],
          code: payload[LOCATION_CODE_KEY],
        });

        if (isSucceed && data) {
          const pointsData = Object.entries(data).reduce(
            (acc: TPointsFilterData, item) => ({
              ...acc,
              [item[0]]: { ...item[1], boundedBy: locationData.boundedBy },
            }),
            {}
          );

          categoryStore.fetchPointsData(pointsData);
        } else {
          categoryStore.fetchPointsData({} as TPointsFilterData);
        }
      } catch (error) {
        console.error(error);
      }
    };

    /**
     * Переключает отображение объектов на мобильных: в виде карты/в виде списка
    */
    const setMapVisible = () => {
      isMapVisible.value = !isMapVisible.value;
    };

    /**
     * Переключает отображение фильтра, соответствующего выбранному типу объектов
    */
    const setFilterVisible = (value: boolean) => {
      isFilterVisible.value = value;
    };

    /**
     * Переключает видимость уведомления, отображаемого при поиске точек погашения
    */
    const setAdsPanelVisible = (value: boolean) => {
      isAdsPanelVisible.value = value;
    };

    /**
     * Устанавливает список отображаемых карточек на основе массива объектов, расположенных в текущих границах карты.
     * Если длина массива больше определённого значения, список карточек разбивается на группы
     * @property {TItemData[]} arr - массив объектов, расположенных в текущих границах карты
    */
    const setCardsList = (arr: TItemData[]) => {
      cardsList.value = arr.filter((_, index) => index < cardsListLength.value);
    };

    /**
     * По клику на элемент дополняет список отображаемых карточек,
     * если количество объектов в границах карты превышает определённое значение
     * @property {TItemData[]} arr - массив объектов, расположенных в текущих границах карты
    */
    const expandCardsList = (arr: TItemData[]) => {
      if (cardsList.value.length === arr.length) {
        return;
      }

      const items = arr.filter((_, index) => index >= cardsList.value.length);

      cardsList.value = [
        ...cardsList.value,
        ...items.filter((_, index) => index < cardsListLength.value),
      ];
    };

    /**
     * Формирует актуальный список филиалов/банкоматов/терминалов, используя данные фильтра
     * @property {TFilterData} data - обновлённые данные фильтра
     * @property {TFilterData} data - prevData фильтра до изменения
    */
    const handleUpdatedLocation = (data: TFilterData, prevData: TFilterData) => {
      if (!prevData) {
        categoryStore.fetchCategoryData(data, data.params || "");
        return;
      }

      const values = Object.keys(data).reduce(
        (acc, key) => data[key] === prevData[key] ? acc : { ...acc, [key]: data[key] },
        {} as Partial<TFilterData>
      );
      const isParamsDataExcluded =
        Object.keys(values).length === 3 &&
        Object.keys(values).filter((key) => [LOCATION_KEY, LOCATION_CODE_KEY, COORDS_KEY].includes(key)).length === 3;

      if (isParamsDataExcluded) {
        yMapHandler.setUpdMapCenter(values);
      } else {
        categoryStore.fetchCategoryData(data, data.params || "");
      }
    };

    onBeforeMount(() => {
      filterStore.initFilter();
      filterStore.setLocationList();
    });

    /**
     * Сбрасывает список карточек в левом сайдбаре при изменении основного массива объектов
    */
    watch(
      () => currentItemsList.value,
      () => {
        categoryStore.setSelectedItemsList();
        //console.log("Cписок карточек обновлён", arr);
      }
    );

    /**
     * Обновляет в зависимости от типа объекта список филиалов/банкоматов/терминалов
     * или точек погашения при изменении данных фильтра
    */
    watch(
      () => currentFilterData.value,
      (data, prevData) => {
        if (data && data.type === POINT_KEY) {
          handlePointsData(data);
        } else {
          handleUpdatedLocation(data, prevData);
        }
        //console.log("Параметры фильтра обновлены", data);
      }
    );

    /**
     * Устанавливает на мобильных отображаемой по умолчанию карту,
     * если в выпадающем списке фильтра выбрана опция "Точки погашения"
    */
    watch(
      () => isPointsListVisible.value,
      (value) => {
        if (value) isMapVisible.value = value;
      }
    );

    /**
     * Изменяет список карточек в левом сайдбаре
     * при изменении данных объектов в пределах границ карты
    */
    watch(
      () => customItemsList.value,
      (arr) => {
        setCardsList(arr);
        yMapHandler.handleCardsList(arr);
        //console.log({ customItemsList: arr.length });
      }
    );

    /**
     * Отображение в консоли количества карточек в сайдбаре
     * при изменении содержащего их массива
    watch(
      () => cardsList.value,
      (arr) => {
        console.log({ cardsList: arr.length });
      }
    );
    */

    return {
      captionsData,
      cardsList,
      currentCategory,
      currentLocation,
      currLocationCaption,
      currLocationList,
      customItemsList,
      isAdsPanelVisible,
      isAlertPanelVisible,
      isCardsListBtnVisible,
      isCategoryListLoading,
      isFilterVisible,
      isMapVisible,
      isPointsListVisible,
      itemsList,
      locationList,
      qrCodeUrl,
      selectedItemsList,
      expandCardsList,
      handleCurrLocation,
      setAdsPanelVisible,
      setFilterVisible,
      setMapVisible,
      setModalOpen: modalStore.setModalOpen,
      setSelectedItemsList: categoryStore.setSelectedItemsList
    };
  },
});
</script>
