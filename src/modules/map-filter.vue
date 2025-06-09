<template>
  <div class="map-filter" ref="mapFilter">
    <button
      class="map-filter__toggler"
      type="button"
      @click="setFilterDropdownOpen(!isFilterDropdownOpen.value)"
    >
      <FilterIcon />
    </button>
    <form
      :class="[
        'map-dropdown map-dropdown_type_filter',
        { 'map-dropdown_type_panel': isPointsListVisible.value },
        { 'is-active': isFilterDropdownOpen.value },
      ]"
      @submit.prevent
      @click.self="setFilterDropdownOpen(false)"
    >
      <div
        class="map__custom-scrollbar"
        :class="[
          'map-dropdown__wrapper',
          { 'map-dropdown__wrapper_height_min': isPointsListVisible.value },
          { 'is-active': isFilterDropdownOpen.value },
        ]"
      >
        <button
          class="map-dropdown__close"
          type="button"
          @click="setFilterDropdownOpen(false)"
        >
          <CloseIcon />
        </button>
        <template v-if="isPointsListVisible.value">
          <div
            v-for="(pointData, index) in pointsFilterList"
            :key="index"
            class="map-dropdown__section"
          >
            <div class="map-dropdown__title" v-if="pointData.title">
              {{ pointData.title }}
            </div>
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
                  :checked="
                    Boolean(pointsFilterData && pointsFilterData[paramData.key])
                  "
                  class="map-toggler"
                  type="checkbox"
                  @change="
                    handlePointsFilterData({
                      ...paramData,
                      target: $event.target,
                    })
                  "
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
                <div class="map-dropdown__desc-caption">
                  {{ descData.caption }}
                </div>
                <div class="map-dropdown__desc-value">{{ descData.value }}</div>
              </div>
            </div>
          </div>
          <button
            class="map-filter-btn"
            type="submit"
            :disabled="!pointsFilterData"
            @click="
              submitFilter({
                data: pointsFilterData,
                type: currentCategory.type,
              })
            "
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
            :disabled="!filterData"
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
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
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


export default defineComponent({
  name: "MapFilter",

  components: {
    CheckedIcon,
    CloseIcon,
    FilterIcon,
  },

  setup() {
    const mapFilter = ref<HTMLElement | null>(null);
    const filterData = ref<Record<string, string> | null>(null);
    const isFilterDropdownOpen = ref<boolean>(false);
    const pointsFilterData = ref<Record<string, string> | null>(null);
    const pointsFilterList = ref<Record<string, string>[]>([
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

    const categoryStore = useCategoryStore();
    const filterStore = useFilterStore();

    const isCategoryListLoading = computed(
      () => categoryStore.isCategoryListLoading
    );
    const currentLocation = computed(() => filterStore.currentLocation);
    const categoryList = computed(() => filterStore.categoryList);
    const currentCategory = computed(() => filterStore.currentCategory);
    const categoryFilterData = computed(() => filterStore.categoryFilterData);
    const currentFilterData = computed(() => filterStore.currentFilterData);

    const isPointsListVisible = computed(
      () => currentCategory.value && currentCategory?.value.type === POINT_KEY
    );
    const currentCategoryData = computed(() => ({
      type: currentCategory.value
        ? currentCategory.value.type
        : categoryList.value[0].type,
      [LOCATION_CODE_KEY]: currentLocation.value
        ? currentLocation.value[LOCATION_CODE_KEY]
        : DEFAULT_LOC_CODE,
    }));
    const filterList = computed(() =>
      categoryFilterData.value
        ? categoryFilterData.value[currentCategoryData.value.type]
        : []
    );
    const pointsFilterConfig = computed(() => ({
      ...pointsFilterList[2].params[0],
      target: {},
      checked: true,
    }));

    const setFilterDropdownOpen = (value) => {
      isFilterDropdownOpen.value = value;
    };

    const handleFilterData = ({ target }) => {
      const { id, checked } = target;

      filterData.value = filterData.value
        ? { ...filterData.value, [id]: Number(checked) }
        : { [id]: Number(checked) };
    };

    const submitFilter = ({ data, type }) => {
      if (!data) {
        return;
      }

      const paramsData = Object.values(data).reduce(
        (acc, item, index) =>
          item ? { ...acc, [Object.keys(data)[index]]: item } : acc,
        {}
      );

      const pointsParamsData = Object.values(data).reduce(
        (acc, item, index) =>
          item.checked ? { ...acc, [Object.keys(data)[index]]: item } : acc,
        {}
      );

      filterStore.setCurrentFilterData({
        ...currentFilterData.value,
        data: type === POINT_KEY ? pointsParamsData : paramsData,
      });
    };

    const updatePointsFilterData = (boundedBy) => {
      if (!pointsFilterData) {
        return {};
      }

      return Object.values(pointsFilterData).reduce(
        (acc, item, index) =>
          item.checked
            ? {
                ...acc,
                [Object.keys(pointsFilterData)[index]]: {
                  ...item,
                  boundedBy,
                },
              }
            : acc,
        {}
      );
    };

    const handlePointsFilterData = (data) => {
      const { key, target } = data;
      const { boundedBy } = currentLocation.value;

      const pointsFilterValues = updatePointsFilterData(boundedBy);

      pointsFilterData.value = pointsFilterData.value
        ? {
            ...pointsFilterValues,
            [key]: { ...data, checked: target.checked, boundedBy },
          }
        : { [key]: { ...data, checked: target.checked, boundedBy } };
    };

    const updatePointsList = ({ boundedBy }) => {
      if (!isPointsListVisible.value) {
        return;
      }

      const pointsFilterData = updatePointsFilterData(boundedBy);

      categoryStore.fetchPointsData(pointsFilterData);
    };
    const closeFilter = (event: MouseEvent) => {
      if (mapFilter.value && !mapFilter.value.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };
    const resetFilter = (payload = null) => {
      pointsFilterData.value =
        payload && payload.type === POINT_KEY
          ? { ...(payload && payload.data && { ...payload.data }) }
          : null;
      filterData.value =
        payload && payload.type !== POINT_KEY
          ? { ...(payload && payload.data && { ...payload.data }) }
          : null;
    };

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

    watch(
      () => currentLocation.value,
      () => resetFilter(currentFilterData.value)
    );

    watch(
      () => isCategoryListLoading.value,
      (value) => {
        if (!value) setFilterDropdownOpen(false);
      }
    );

    watch(
      () => isFilterDropdownOpen.value,
      (value) => {
        //this.$emit("handleFilterVisibility", value);
      }
    );

    onMounted(() => {
      document.addEventListener("mousedown", closeFilter);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("mousedown", closeFilter);
    });

    return {
      isFilterDropdownOpen,
      isPointsListVisible,
      setFilterDropdownOpen,
    };
  },
});
</script>
