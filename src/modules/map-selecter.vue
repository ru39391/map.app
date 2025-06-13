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
import type { TFilterData } from "../utils/types";
import { useFilterStore } from "../store/modules/filter";
import ExpendMoreIcon from "../assets/icons/expend-more-icon.vue";

/**
 * Выпадающее меню с параметрами фильтра
 *
 * @component
 * @example
 * <MapSelecter />
 */
export default defineComponent({
  name: "MapSelecter",

  components: {
    ExpendMoreIcon,
  },

  setup() {
    const mapSelecter = ref<HTMLElement | null>(null);
    const isCategoryDropdownOpen = ref<boolean>(false);

    const filterStore = useFilterStore();
    const categoryList = computed(() => filterStore.categoryList);
    const currentCategory = computed(() => filterStore.currentCategory);
    const currentFilterData = computed(() => filterStore.currentFilterData);

    const selecterCaption = computed(() => currentCategory.value ? currentCategory.value.caption : '');

    /**
     * Изменяет видимость выпадающего меню с категориями фильтра
     * @property {boolean} value - истинное, если отображаем выпадающее меню
    */
    const setCategoryDropdownOpen = (value: boolean) => {
      isCategoryDropdownOpen.value = value;
    };

    /**
     * Устанавливает категорию фильтра (отделения/банкоматы/терминалы/точки погашения)
     * @property {TFilterData['type']} type - категория фильтра
    */
    const handleCurrentCategory = ({ type }: { type: TFilterData['type']; }) => {
      setCategoryDropdownOpen(false);

      if (currentCategory.value && type === currentCategory.value.type) {
        return;
      }

      filterStore.setCurrentFilterData({ ...currentFilterData.value, type, data: null });
    };

    /**
     * Закрывает меню фильтра по клику
     * @property {MouseEvent} event
    */
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
      mapSelecter,
      categoryList,
      currentCategory,
      isCategoryDropdownOpen,
      selecterCaption,
      handleCurrentCategory,
      setCategoryDropdownOpen
    };
  },
});
</script>
