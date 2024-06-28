<template>
  <div className="map-wrapper h-100">
    <div className="map-sidebar">
      <div className="map-filter-holder">
        <MapSelecter />
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { FILIAL_KEY } from './utils/constants';
  import { useCategoryStore } from './store/modules/category';
  import MapSelecter from './map-selecter.vue';

  export default {
    components: {
      MapSelecter
    },

    computed: {
      ...mapState(useCategoryStore, ['categoryList']),
    },

    methods: {
      ...mapActions(
        useCategoryStore,
        [
          'fetchCategoryData',
          'setCurrentCategory'
        ]
      ),
    },

    beforeMount() {
      this.fetchCategoryData(FILIAL_KEY);
      this.setCurrentCategory(this.categoryList[0]);
    }
  }
</script>
