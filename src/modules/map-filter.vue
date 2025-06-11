<template>
  <div class="map-filter" ref="mapFilter">
    <button
      class="map-filter__toggler"
      type="button"
      @click="setFilterDropdownOpen(!isFilterDropdownOpen)"
    >
      <FilterIcon />
    </button>
    <form
      :class="[
        'map-dropdown map-dropdown_type_filter',
        { 'map-dropdown_type_panel': isPointsListVisible },
        { 'is-active': isFilterDropdownOpen },
      ]"
      @submit.prevent
      @click.self="setFilterDropdownOpen(false)"
    >
      <div
        class="map__custom-scrollbar"
        :class="[
          'map-dropdown__wrapper',
          { 'map-dropdown__wrapper_height_min': isPointsListVisible },
          { 'is-active': isFilterDropdownOpen },
        ]"
      >
        <button
          class="map-dropdown__close"
          type="button"
          @click="setFilterDropdownOpen(false)"
        >
          <CloseIcon />
        </button>
        <template v-if="isPointsListVisible">
          <div
            v-for="(pointData, index) in pointsFilterList"
            :key="index"
            class="map-dropdown__section"
          >
            <div class="map-dropdown__title" v-if="pointData.title">{{ pointData.title }}</div>
            <div
              class="map-dropdown__list map-dropdown__list_mb_min"
              v-if="pointData.params.length"
            >
              <template
                v-for="paramData in pointData.params"
                :key="paramData.key"
              >
                <input
                  :id="paramData.key"
                  :checked="Boolean(pointsFilterData && pointsFilterData[paramData.key])"
                  class="map-toggler"
                  type="checkbox"
                  @change="handlePointsFilterData({ ...paramData, target: $event.target })"
                />
                <label :for="paramData.key" class="map-toggler-label">
                  <span class="map-toggler-label__icon"><CheckedIcon /></span>
                  {{ paramData.caption }}
                </label>
              </template>
            </div>
            <div class="map-dropdown__desc" v-if="pointData.desc.length">
              <div
                v-for="(descData, idx) in pointData.desc"
                :key="idx"
                class="map-dropdown__desc-row"
              >
                <div class="map-dropdown__desc-caption">{{ descData.caption }}</div>
                <div class="map-dropdown__desc-value">{{ descData.value }}</div>
              </div>
            </div>
          </div>
          <button
            class="map-filter-btn"
            type="submit"
            :disabled="isPointsFilterBtnDisabled"
            @click="submitFilter({ data: pointsFilterData, type: currentCategory.type })"
          >
            Применить
          </button>
        </template>
        <template v-else>
          <div class="map-dropdown__title is-mobile-only">Фильтры</div>
          <div class="map-dropdown__list">
            <template v-for="item in filterList" :key="item.code">
              <input
                :id="item.code"
                :checked="Boolean(filterData && filterData[item.code])"
                class="map-toggler"
                type="checkbox"
                @change="handleFilterData($event)"
              />
              <label :for="item.code" class="map-toggler-label">
                <span class="map-toggler-label__icon"><CheckedIcon /></span>
                {{ item.name }}
              </label>
            </template>
          </div>
          <button
            class="map-filter-btn"
            type="submit"
            :disabled="isFilterBtnDisabled"
            @click="submitFilter({ data: filterData })"
          >
            Применить
          </button>
        </template>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, defineEmits, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type {
  TFilterData,
  TPointsFilterData,
  TPointsFilterKeys,
  TPointsFilterList,
  TPointsFilterValues
} from '../utils/types';
import {
  POINT_KEY,
  BEELINE_KEY,
  MTS_KEY,
  KH_KEY,
  KARI_KEY,
  LXNET_KEY,
  RUPOST_KEY,
  LOCATION_CODE_KEY,
  DEFAULT_LOC_CODE,
} from "../utils/constants";
import { useCategoryStore } from "../store/modules/category";
import { useFilterStore } from "../store/modules/filter";
import CheckedIcon from "../assets/icons/checked-icon.vue";
import CloseIcon from "../assets/icons/close-icon.vue";
import FilterIcon from "../assets/icons/filter-icon.vue";

/**
 * Меню дочерних параметров фильтра
 *
 * @component
 * @example
 * <MapFilter />
 */
export default defineComponent({
  name: "MapFilter",

  components: {
    CheckedIcon,
    CloseIcon,
    FilterIcon,
  },

  emits: ['handleFilterVisibility'],

  setup(_, { emit }) {
    const mapFilter = ref<HTMLElement | null>(null);
    const filterData = ref<Record<string, 1 | 0> | null>(null);
    const isFilterDropdownOpen = ref<boolean>(false);
    const pointsFilterData = ref<TPointsFilterData | null>(null);
    const pointsFilterList = ref<TPointsFilterList[]>([
      {
        title: "Сеть партнера",
        params: [
          {
            key: BEELINE_KEY,
            caption: "Билайн",
            request: "Салон Билайн",
          },
          {
            key: MTS_KEY,
            caption: "МТС",
            request: "Салон МТС",
          },
          {
            key: KH_KEY,
            caption: "Ноу-Хау",
            request: "Магазин ИОН",
          },
          {
            key: KARI_KEY,
            caption: "Kari Россия",
            request: "Kari Россия",
          },
        ],
        desc: [
          {
            caption: "Комиссия:",
            value: "1% но не менее 50 рублей",
          },
          {
            caption: "Срок зачисления:",
            value: "моментально",
          },
          {
            caption: "Ограничения:",
            value: "нет ограничений",
          },
          {
            caption: "Потребуется:",
            value: "номер счета, паспорт",
          },
        ],
      },
      {
        title: "Другие способы",
        params: [
          {
            key: LXNET_KEY,
            caption: "Элекснет",
            request: "Элекснет",
          },
        ],
        desc: [
          {
            caption: "Комиссия:",
            value: "1,4% но не менее 50 рублей",
          },
          {
            caption: "Срок зачисления:",
            value: "моментально",
          },
          {
            caption: "Ограничения:",
            value:
              "cумма одной операции не более 15 000 р. Сумма операций в сутки через один терминал не более 90 000 р. Сумма операций в сутки через все терминалы сети не более 585 000 р.",
          },
          {
            caption: "Потребуется:",
            value: "номер счета",
          },
        ],
      },
      {
        title: "",
        params: [
          {
            key: RUPOST_KEY,
            caption: "Почта России",
            request: "Почта России",
          },
        ],
        desc: [
          {
            caption: "Комиссия:",
            value: "нет комиссии",
          },
          {
            caption: "Срок зачисления:",
            value: "в течение пяти банковских дней",
          },
          {
            caption: "Ограничения:",
            value: "платеж: не более 500 000 р.",
          },
          {
            caption: "Потребуется:",
            value: "паспорт, квитанция для оплаты",
          },
        ],
      },
    ]);

    const isFilterBtnDisabled = computed(() =>
      filterData.value
        ? Object.values(filterData.value).length === 0 || Object.values(filterData.value).reduce((acc, value) => !value && acc, true)
        : !filterData.value
    );

    const isPointsFilterBtnDisabled = computed(
      () => pointsFilterData.value ? Object.values(pointsFilterData.value).reduce((acc, data) => !data.checked && acc, true) : !pointsFilterData.value
    );

    const categoryStore = useCategoryStore();
    const isCategoryListLoading = computed(() => categoryStore.isCategoryListLoading);

    const filterStore = useFilterStore();
    /**
     * Список категорий фильтра
     *
     * @returns {TCategoryListData[]}
    */
    const categoryList = computed(() => filterStore.categoryList);
    /**
     * Текущая категория фильтра
     *
     * @returns {TCategoryListData}
    */
    const currentCategory = computed(() => filterStore.currentCategory);
    /**
     * Объект, содержащий массивы дочерних параметров категорий фильтра (для филиалов/банкоматов/терминалов)
     *
     * @returns {Record<TCategoryData['category'], Record<'name' | 'code', string>[]> | null}
    */
    const categoryFilterData = computed(() => filterStore.categoryFilterData);
    /**
     * Текущие параметры фильтра
     *
     * @returns {TFilterData | null}
    */
    const currentFilterData = computed(() => filterStore.currentFilterData);
    /**
     * Текущая геолокация
     *
     * @returns {TLocationData | null}
    */
    const currentLocation = computed(() => filterStore.currentLocation);

    const isPointsListVisible = computed(() => currentCategory.value && currentCategory?.value.type === POINT_KEY);
    /**
     * Категория и геолокация в фильтре по умолчанию
    */
    const currentCategoryData = computed(() => ({
      type: currentCategory.value ? currentCategory.value.type : categoryList.value[0].type,
      [LOCATION_CODE_KEY]: currentLocation.value ? currentLocation.value[LOCATION_CODE_KEY] : DEFAULT_LOC_CODE,
    }));
    /**
     * Массив дочерних параметров категорий фильтра (для филиалов/банкоматов/терминалов)
    */
    const filterList: ComputedRef<Record<'name' | 'code', string>[]> = computed(
      () => categoryFilterData.value ? categoryFilterData.value[currentCategoryData.value.type] : []
    );
    /**
     * Конфигурация параметров фильтра точек погашения по умолчанию
    */
    const pointsFilterConfig = computed(() => ({
      ...pointsFilterList.value[2].params[0],
      target: {},
      checked: true,
    }));

    /**
     * Показывает/скрывает меню дочерних параметров фильтра
     * @property {boolean} value
    */
    const setFilterDropdownOpen = (value: boolean) => {
      isFilterDropdownOpen.value = value;
    };

    /**
     * Устанавливает значения дочерних параметров фильтра филиалов/банкоматов/терминалов по клику на чекбоксы
     * @property {HTMLInputElement} target - чекбокс в меню дочерних параметров фильтра филиалов/банкоматов/терминалов
    */
    const handleFilterData = ({ target }: { target: HTMLInputElement; }) => {
      const { id, checked } = target;

      filterData.value = filterData.value ? { ...filterData.value, [id]: Number(checked) as 0 | 1 } : { [id]: Number(checked) as 0 | 1 };
    };

    /**
     * Производит фильтрацию объектов по выбранным параметрам
     * @property {TFilterData['data']} data - дочерние параметры фильтра
     * @property {TFilterData['type']} type - тип объекта (филиал/банкомат/терминал/точка погашения)
    */
    const submitFilter = ({ data, type }: Pick<TFilterData, 'data' | 'type'>) => {
      if (!data) {
        return;
      }

      const paramsData = Object.entries(data).reduce(
        (acc, [key, value]: [string, 0 | 1]) => value ? { ...acc, [key]: value } : acc,
        {} as Record<string, 1 | 0>
      );

      const pointsParamsData = Object.entries(data).reduce(
        (acc, [key, value]: [TPointsFilterKeys, TPointsFilterValues]) => value.checked ? { ...acc, [key]: value } : acc,
        {} as TPointsFilterData
      );

      filterStore.setCurrentFilterData({
        ...currentFilterData.value,
        data: type === POINT_KEY ? pointsParamsData : paramsData,
      });
    };

    /**
     * Обновляет параметры фильтра точек погашения при изменении координат границ карты
     * @property {TPointsFilterValues['boundedBy']} boundedBy - координаты границ карты
     * @returns {TPointsFilterData} параметры фильтра точек погашения
    */
    const updatePointsFilterData = (boundedBy: TPointsFilterValues['boundedBy']): TPointsFilterData => {
      if (!pointsFilterData.value) {
        return {} as TPointsFilterData;
      }

      return Object.entries(pointsFilterData.value).reduce(
        (acc, [key, value]: [TPointsFilterKeys, TPointsFilterValues]) => value.checked ? { ...acc, [key]: { ...value, boundedBy } } : acc,
        {} as TPointsFilterData
      );
    };

    /**
     * Устанавливает значения дочерних параметров фильтра точек погашения по клику на чекбоксы
     * @property {TPointsFilterValues} data - данные, соответствующие чекбоксу параметра точки погашения
    */
    const handlePointsFilterData = (data: TPointsFilterValues) => {
      const { key, target } = data;
      const { boundedBy } = currentLocation.value;

      const pointsFilterValues = updatePointsFilterData(boundedBy);

      pointsFilterData.value = pointsFilterData.value
        ? { ...pointsFilterValues, [key]: { ...data, checked: target.checked, boundedBy } }
        : { [key]: { ...data, checked: target.checked, boundedBy } };
    };

    /**
     * Закрыть меню дочерних параметров фильтра по клику
     * @property {MouseEvent} event
    */
    const closeFilter = (event: MouseEvent) => {
      if (mapFilter.value && !mapFilter.value.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };

    /**
     * Обновить параметры фильтра
     * @property {Partial<TFilterData> | null} payload - обновлённое значение параметров фильтра
    */
    const resetFilter = (payload: Partial<TFilterData> | null = null) => {
      pointsFilterData.value = payload && payload.type === POINT_KEY ? { ...(payload && payload.data && { ...payload.data }) } : null;

      filterData.value = payload && payload.type !== POINT_KEY ? { ...(payload && payload.data && { ...payload.data as Record<string, 0 | 1> }) } : null;
    };

    /**
     * Обновить параметры фильтра при изменении его основных данных
     * @property {TFilterData | null} updData - обновлённое значение параметров фильтра
    */
    watch(
      () => currentFilterData.value,
      (updData) => {
        const { boundedBy } = currentLocation.value;

        if (updData.type === POINT_KEY && updData.data === null) {
          submitFilter({
            data: {
              [pointsFilterConfig.value.key]: {
                ...pointsFilterConfig.value,
                boundedBy,
              },
            },
            type: POINT_KEY,
          });
          resetFilter({
            data: {
              [pointsFilterConfig.value.key]: {
                ...pointsFilterConfig.value,
                boundedBy,
              },
            },
          });
        } else {
          resetFilter(updData);
        }
      }
    );

    /**
     * Обновить параметры фильтра при изменении данных геолокации
     * @property {TFilterData | null} updData - обновлённое значение параметров фильтра
    */
    watch(
      () => currentLocation.value,
      () => resetFilter(currentFilterData.value)
    );

    /**
     * Скрыть меню дочерних параметров фильтра после обновления списка объектов
     * @property {boolean} value - истинно, если обновления списка объектов в процессе
    */
    watch(
      () => isCategoryListLoading.value,
      (value) => {
        if (!value) setFilterDropdownOpen(false);
      }
    );

    /**
     * Передать в родительский компонент значение отображения меню дочерних параметров фильтра
     * @property {boolean} value - истинно, если меню дочерних параметров фильтра отображается
    */
    watch(
      () => isFilterDropdownOpen.value,
      (value) => {
        emit('handleFilterVisibility', value);
      }
    );
    watch(
      () => filterData.value,
      (value) => {
        console.log('filterData', value);
      }
    );

    onMounted(() => {
      document.addEventListener("mousedown", closeFilter);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("mousedown", closeFilter);
    });

    return {
      currentCategory,
      filterList,
      isFilterBtnDisabled,
      isFilterDropdownOpen,
      isPointsFilterBtnDisabled,
      isPointsListVisible,
      mapFilter,
      pointsFilterData,
      pointsFilterList,
      handleFilterData,
      handlePointsFilterData,
      setFilterDropdownOpen,
      submitFilter
    };
  },
});
</script>
