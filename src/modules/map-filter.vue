<template>
  <div class="map-filter" ref="mapFilter">
    <button class="map-filter__toggler" type="button" @click="setFilterDropdownOpen(!isFilterDropdownOpen)"><FilterIcon /></button>
    <form
      :class="[
        'map-dropdown map-dropdown_type_filter',
        { 'map-dropdown_type_panel': isPointsListVisible },
        { 'is-active': isFilterDropdownOpen }
      ]"
      @submit.prevent
      @click.self="setFilterDropdownOpen(false)"
    >
      <div
        :class="[
          'map-dropdown__wrapper',
          { 'map-dropdown__wrapper_height_min': isPointsListVisible },
          { 'is-active': isFilterDropdownOpen }
        ]"
      >
        <button class="map-dropdown__close" type="button" @click="setFilterDropdownOpen(false)"><CloseIcon /></button>
        <template v-if="isPointsListVisible">
          <div
            v-for="(pointData, index) in pointsFilterList"
            :key="index"
            class="map-dropdown__section"
          >
            <div class="map-dropdown__title" v-if="pointData.title">{{ pointData.title }}</div>
            <div class="map-dropdown__list map-dropdown__list_mb_min" v-if="pointData.params.length">
              <template
                v-for="paramData in pointData.params"
                :key="paramData.key"
              >
                <input
                  :id="paramData.key"
                  :checked="Boolean(pointsFilterData && pointsFilterData[paramData.key])"
                  class="map-toggler"
                  type="checkbox"
                  @change="handlePointsFilterData({...paramData, target: $event.target})"
                />
                <label
                  :for="paramData.key"
                  class="map-toggler-label"
                >
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
            :disabled="!pointsFilterData"
            @click="fetchPointsData(pointsFilterData)"
          >
            Применить
          </button>
        </template>
        <template v-else>
          <div class="map-dropdown__title is-mobile-only">Фильтры</div>
          <div class="map-dropdown__list">
            <template
              v-for="item in filterList"
              :key="item.code"
            >
              <input
                :id="item.code"
                :checked="Boolean(filterData && filterData[item.code])"
                class="map-toggler"
                type="checkbox"
                @change="handleFilterData($event)"
              />
              <label
                :for="item.code"
                class="map-toggler-label"
              >
                <span class="map-toggler-label__icon"><CheckedIcon /></span>
                {{ item.name }}
              </label>
            </template>
          </div>
          <button
            class="map-filter-btn"
            type="submit"
            :disabled="!filterData"
            @click="submitFilter(filterData)"
          >
            Применить
          </button>
        </template>
      </div>
    </form>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { POINT_KEY, BEELINE_KEY, MTS_KEY, KH_KEY, KARI_KEY, LXNET_KEY, RUPOST_KEY, LOCATION_CODE_KEY, DEFAULT_LOC_CODE } from '../utils/constants';
  import { useCategoryStore } from '../store/modules/category';
  import { useLocationStore } from '../store/modules/location';
  import CheckedIcon from '../assets/icons/checked-icon.vue';
  import CloseIcon from '../assets/icons/close-icon.vue';
  import FilterIcon from '../assets/icons/filter-icon.vue';

  export default {
    name: 'map-filter',

    components: {
      CheckedIcon,
      CloseIcon,
      FilterIcon
    },

    data() {
      return {
        filterData: null,
        isFilterDropdownOpen: false,
        pointsFilterData: null,
        pointsFilterList: [{
          title: 'Золотая корона',
          params: [{
            key: BEELINE_KEY,
            caption: 'Билайн',
            request: 'Салон Билайн'
          }, {
            key: MTS_KEY,
            caption: 'МТС',
            request: 'Салон МТС'
          }, {
            key: KH_KEY,
            caption: 'Ноу-Хау',
            request: 'Магазин ИОН'
          }, {
            key: KARI_KEY,
            caption: 'Kari Россия',
            request: 'Kari Россия'
          }],
          desc: [{
            caption: 'Комиссия:',
            value: '1% но не менее 50 рублей'
          }, {
            caption: 'Срок зачисления:',
            value: 'моментально'
          }, {
            caption: 'Ограничения:',
            value: 'нет ограничений'
          }, {
            caption: 'Потребуется:',
            value: 'номер счета, паспорт'
          }]
        }, {
          title: 'Другие способы',
          params: [{
            key: LXNET_KEY,
            caption: 'Элекснет',
            request: 'Элекснет'
          }],
          desc: [{
            caption: 'Комиссия:',
            value: '1,4% но не менее 50 рублей'
          }, {
            caption: 'Срок зачисления:',
            value: 'моментально'
          }, {
            caption: 'Ограничения:',
            value: 'cумма одной операции не более 15 000 р. Сумма операций в сутки через один терминал не более 90 000 р. Сумма операций в сутки через все терминалы сети не более 585 000 р.'
          }, {
            caption: 'Потребуется:',
            value: 'номер счета'
          }],
        }, {
          title: '',
          params: [{
            key: RUPOST_KEY,
            caption: 'Почта России',
            request: 'Почта России'
          }],
          desc: [{
            caption: 'Комиссия:',
            value: 'нет комиссии'
          }, {
            caption: 'Срок зачисления:',
            value: 'в течение пяти банковских дней'
          }, {
            caption: 'Ограничения:',
            value: 'платеж: не более 500 000 р.'
          }, {
            caption: 'Потребуется:',
            value: 'паспорт, квитанция для оплаты'
          }],
        }]
      };
    },

    computed: {
      ...mapState(
        useCategoryStore,
        [
          'categoryFilterData',
          'currentCategory',
          'categoryList'
        ]
      ),

      ...mapState(useCategoryStore, ['isCategoryListLoading']),

      ...mapState(useLocationStore, ['currentLocation']),

      isPointsListVisible() {
        return this.currentCategory && this.currentCategory.type === POINT_KEY;
      },

      currentCategoryData() {
        return {
          type: this.currentCategory ? this.currentCategory.type : this.categoryList[0].type,
          [LOCATION_CODE_KEY]: this.currentLocation ? this.currentLocation[LOCATION_CODE_KEY] : DEFAULT_LOC_CODE
        };
      },

      filterList() {
        return this.categoryFilterData ? this.categoryFilterData[this.currentCategoryData.type] : [];
      }
    },

    methods: {
      ...mapActions(useCategoryStore, ['fetchCategoryData', 'fetchPointsData']),

      setFilterDropdownOpen(value) {
        this.isFilterDropdownOpen = value;
      },

      handleFilterData({ target }) {
        const { id, checked } = target;

        this.filterData = this.filterData ? { ...this.filterData, [id]: Number(checked) } : { [id]: Number(checked) };
      },

      submitFilter(data) {
        if(!data)  {
          return;
        }

        const paramsData = Object.values(data).reduce((acc, item, index) => item ? ({ ...acc, [Object.keys(data)[index]]: item }) : acc, {});
        const params = Object.keys(paramsData).reduce(
          (acc, item, index) => acc + `${index === 0 ? '?' : '&'}${item}=${Object.values(paramsData)[index]}`, ''
        );

        this.fetchCategoryData({ ...this.currentCategoryData }, params);
      },

      updatePointsFilterData(boundedBy) {
        if(!this.pointsFilterData) {
          return {};
        }

        return Object.values(this.pointsFilterData).reduce(
          (acc, item, index) => ({ ...acc, [Object.keys(this.pointsFilterData)[index]]: { ...item, boundedBy } }), {}
        );
      },

      handlePointsFilterData(data) {
        const { key, target } = data;
        const { boundedBy } = this.currentLocation;

        const pointsFilterData = this.updatePointsFilterData(boundedBy);

        this.pointsFilterData = this.pointsFilterData
          ? { ...pointsFilterData, [key]: { ...data, checked: target.checked, boundedBy } }
          : { [key]: { ...data, checked: target.checked, boundedBy } };
      },

      updatePointsList({ boundedBy }) {
        if(!this.isPointsListVisible) {
          return;
        }

        const pointsFilterData = this.updatePointsFilterData(boundedBy);

        this.fetchPointsData(pointsFilterData);
      },

      closeFilter({ target }) {
        if(!this.$refs.mapFilter.contains(target)) {
          this.setFilterDropdownOpen(false);
        }
      },

      resetFilter() {
        this.filterData = null;
        this.pointsFilterData = null;
      }
    },

    watch: {
      currentCategory() {
        this.resetFilter();
      },

      isCategoryListLoading(value) {
        if(!value) this.setFilterDropdownOpen(false);
      },

      currentLocation(data) {
        this.resetFilter();
        /*
        if(this.isPointsListVisible) {
          this.updatePointsList(data);
        } else {
          // срабатывает вотчер из map-office-list, что вызывает ошибку удаления карты
          this.submitFilter(this.filterData);
        }
        */
      },

      isFilterDropdownOpen(value) {
        this.$emit('handleFilterVisibility', value);
      },

      filterData(data) {
        console.log('Список параметров фильтра обновлён', data);
      },

      pointsFilterData(data) {
        console.log('Список параметров фильтра точек погашения обновлён', data);
      },
    },

    mounted() {
      document.addEventListener('mousedown', this.closeFilter);
    },

    beforeUnmount() {
      document.removeEventListener('mousedown', this.closeFilter);
    }
  };
</script>
