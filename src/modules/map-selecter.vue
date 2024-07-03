<template>
  <div class="map-selecter" ref="mapSelecter">
    <button class="map-selecter__placeholder" type="button" @click="setCategoryDropdownOpen(!isCategoryDropdownOpen)">
      <span class="map-selecter__caption">{{ selecterCaption }}</span>
      <ExpendMoreIcon />
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
  import { useCategoryStore } from '../store/modules/category';
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

      selecterCaption() {
        return this.currentCategory ? this.currentCategory.caption : '';
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
        this.fetchCategoryData(type);
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
