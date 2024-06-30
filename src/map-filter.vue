<template>
  <div class="map-filter"> <!--  ref={filterDropdownRef} -->
    <button class="map-filter__toggler" type="button" @click="setFilterDropdownOpen(!isFilterDropdownOpen)"><FilterIcon /></button>
    <form class="map-dropdown map-dropdown_type_filter" @submit.prevent>
      <div
        :class="['map-dropdown__wrapper map-dropdown__wrapper_type_filter', { 'is-active': isFilterDropdownOpen }]"
      >
        <button class="map-dropdown__close" type="button" @click="setFilterDropdownOpen(false)"><CloseIcon /></button>
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
      </div>
    </form>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { useCategoryStore } from './store/modules/category';
  import CheckedIcon from './assets/icons/checked-icon.vue';
  import CloseIcon from './assets/icons/close-icon.vue';
  import FilterIcon from './assets/icons/filter-icon.vue';

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
        isFilterDropdownOpen: false
      };
    },

    computed: {
      ...mapState(
        useCategoryStore,
        [
          'filterList',
          'currentCategory',
          'categoryList'
        ]
      ),
    },

    methods: {
      ...mapActions(useCategoryStore, ['fetchCategoryData']),

      setFilterDropdownOpen(value) {
        this.isFilterDropdownOpen = value;
      },

      handleFilterData({ target }) {
        const { id, checked } = target;

        this.filterData = this.filterData ? { ...this.filterData, [id]: Number(checked) } : { [id]: Number(checked) };
      },

      submitFilter(data) {
        const paramsData = Object.values(data).reduce((acc, item, index) => item ? ({ ...acc, [Object.keys(data)[index]]: item }) : acc, {});
        const params = Object.keys(paramsData).reduce(
          (acc, item, index) => acc + `${index === 0 ? '?' : '&'}${item}=${Object.values(paramsData)[index]}`, ''
        );

        this.fetchCategoryData(this.currentCategory ? this.currentCategory.type : this.categoryList[0].type, params);
      }
    },

    watch: {
      currentCategory() {
        this.filterData = null;
      },

      filterData(arr) {
        console.log(arr);
      }
    }
  };
</script>
