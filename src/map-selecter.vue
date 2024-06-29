<template>
  <div class="map-selecter"> <!--  ref={categoryDropdownRef} -->
    <button class="map-selecter__placeholder" type="button" @click="setCategoryDropdownOpen(!isCategoryDropdownOpen)">
      <span class="map-selecter__caption">{{ selecterCaption }}</span>
      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.40781 9.33345L17.2905 1.50236L16.4872 0.704722L9.35608 7.78953L9.00385 8.13947L8.65145 7.7897L1.5129 0.704558L0.709673 1.50219L8.59946 9.33337L8.59954 9.33345C8.82314 9.55549 9.1841 9.55552 9.40773 9.33353C9.40776 9.3335 9.40778 9.33348 9.40781 9.33345Z" fill="#0D0D0D" stroke="#242424"/>
      </svg>
    </button>
    <div class="map-dropdown" v-if="isCategoryDropdownOpen">
      <div :class="['map-dropdown__wrapper', { 'map-dropdown__wrapper_active': isCategoryDropdownOpen }]">
        <button
          v-for="categoryItem in categoryList"
          :key="categoryItem.type"
          :class="['map-dropdown__toggler', { 'map-dropdown__toggler_active': categoryItem.type === currentCategory.type }]"
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
  import { useCategoryStore } from './store/modules/category';

  export default {
    name: 'map-selecter',

    data() {
      return {
      };
    },

    computed: {
      ...mapState(
        useCategoryStore,
        [
          'categoryList',
          'currentCategory',
          'isCategoryDropdownOpen'
        ]
      ),

      selecterCaption() {
        return this.currentCategory ? this.currentCategory.caption : '';
      }
    },

    methods: {
      ...mapActions(
        useCategoryStore,
        [
          'fetchCategoryData',
          'setCurrentCategory',
          'setCategoryDropdownOpen'
        ]
      ),

      handleCurrentCategory({type, caption, category}) {
        this.setCategoryDropdownOpen(false);

        if(this.currentCategory && type === this.currentCategory.type) {
          return;
        }

        this.setCurrentCategory({type, caption, category});

        //this.setFilterData(null);
        this.fetchCategoryData(type);
      }
    }
  };
</script>
