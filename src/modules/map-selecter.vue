<template>
  <div class="map-selecter" ref="mapSelecter">
    <button
      :class="[
        'map-selecter__placeholder',
        { 'is-active': isCategoryDropdownOpen },
      ]"
      type="button"
      @click="setCategoryDropdownOpen(!isCategoryDropdownOpen)"
    >
      <span class="map-selecter__caption">{{ selecterCaption }}</span>
      <ExpendMoreIcon class="map-selecter__arrow" />
    </button>
    <div class="map-dropdown" v-if="isCategoryDropdownOpen">
      <div
        :class="[
          'map-dropdown__wrapper',
          { 'is-active': isCategoryDropdownOpen },
        ]"
      >
        <button
          v-for="categoryItem in categoryList"
          :key="categoryItem.type"
          :class="[
            'map-dropdown__toggler',
            { 'is-active': categoryItem.type === currentCategory.type },
          ]"
          type="button"
          @click="handleCurrentCategory(categoryItem)"
        >
          {{ categoryItem.caption }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { useFilterStore } from "../store/modules/filter";
import ExpendMoreIcon from "../assets/icons/expend-more-icon.vue";

export default defineComponent({
  name: "MapSelecter",

  components: {
    ExpendMoreIcon,
  },

  setup() {
    const mapSelecter = ref<HTMLElement | null>(null)
    const isCategoryDropdownOpen = ref<boolean>(false);
    const filterStore = useFilterStore();
    const {
      categoryList,
      currentCategory,
      currentFilterData
    } = computed(
      () => ({
        categoryList: filterStore.categoryList,
        currentCategory: filterStore.currentCategory,
        currentFilterData: filterStore.currentFilterData,
      })
    );
    const selecterCaption = computed(() => currentCategory ? currentCategory.caption : '');

    const setCategoryDropdownOpen = (value: boolean) => isCategoryDropdownOpen.value = value;
    const handleCurrentCategory = ({ type }) => {
      setCategoryDropdownOpen(false);

      if (currentCategory && type === currentCategory.type) {
        return;
      }

      filterStore.setCurrentFilterData({ ...currentFilterData, type, data: null });
    };
    const closeDropdown = (event: MouseEvent) => {
      if (mapSelecter.value && !mapSelecter.value.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };

    onMounted(() => {
      document.addEventListener("mousedown", closeDropdown);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("mousedown", closeDropdown);
    });

    return {
      categoryList,
      isCategoryDropdownOpen,
      selecterCaption,
      handleCurrentCategory,
      setCategoryDropdownOpen
    };
  },
});
</script>
