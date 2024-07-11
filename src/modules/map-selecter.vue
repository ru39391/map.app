<template>
  <div class="map-selecter" ref="mapSelecter">
    <button
      :class="[
        'map-selecter__placeholder',
        { 'is-active': isCategoryDropdownOpen }
      ]"
      type="button"
      @click="setCategoryDropdownOpen(!isCategoryDropdownOpen)"
    >
      <span class="map-selecter__caption">{{ selecterCaption }}</span>
      <ExpendMoreIcon class="map-selecter__arrow" />
    </button>
    <div class="map-dropdown" v-if="isCategoryDropdownOpen">
      <div :class="['map-dropdown__wrapper', { 'is-active': isCategoryDropdownOpen }]">
        <button
          v-for="categoryItem in categoryList"
          :key="categoryItem.type"
          :class="['map-dropdown__toggler', { 'is-active': categoryItem.type === currentCategory.type }]"
          type="button"
          @click="handleCurrentCategory(categoryItem)"
        >
          {{ categoryItem.caption }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { LOCATION_CODE_KEY, DEFAULT_LOC_CODE } from '../utils/constants';
  import { useCategoryStore } from '../store/modules/category';
  import { useLocationStore } from '../store/modules/location';
  import ExpendMoreIcon from '../assets/icons/expend-more-icon.vue';

  export default {
    name: 'map-selecter',

    components: {
      ExpendMoreIcon
    },

    data() {
      return {
        isCategoryDropdownOpen: false
      }
    },

    computed: {
      ...mapState(
        useCategoryStore,
        [
          'categoryList',
          'currentCategory'
        ]
      ),

      ...mapState(useLocationStore, ['currentLocation']),

      selecterCaption() {
        return this.currentCategory ? this.currentCategory.caption : '';
      },

      currentLocationData() {
        return { [LOCATION_CODE_KEY]: this.currentLocation ? this.currentLocation[LOCATION_CODE_KEY] : DEFAULT_LOC_CODE };
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

      setCategoryDropdownOpen(value) {
        this.isCategoryDropdownOpen = value;
      },

      handleCurrentCategory({type, caption, category}) {
        this.setCategoryDropdownOpen(false);

        if(this.currentCategory && type === this.currentCategory.type) {
          return;
        }

        this.setCurrentCategory({type, caption, category});

        this.fetchCategoryData({
          type,
          ...this.currentLocationData
        });
      },

      closeDropdown({ target }) {
        if(!this.$refs.mapSelecter.contains(target)) {
          this.setCategoryDropdownOpen(false);
        }
      }
    },

    mounted() {
      document.addEventListener('mousedown', this.closeDropdown);
    },

    beforeUnmount() {
      document.removeEventListener('mousedown', this.closeDropdown);
    }
  };
</script>
