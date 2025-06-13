<template>
  <div
    class="map-overlay map-overlay_type_holder map-overlay_type_panel is-mobile-only"
    v-if="selectedItemsList.length"
    @click.self="setSelectedItemsList([])"
  >
    <div
      :class="[
        'map-modal map-modal_type_panel is-active',
        { 'is-hidden': !selectedItemsList.length },
      ]"
      @touchstart.self="handleTouchStart"
      @touchmove.self="handleTouchMove"
    >
      <div class="map-modal__header">
        <button
          class="map-modal__close map-modal__close_mb_none"
          type="button"
          @click="setSelectedItemsList([])"
        >
          <CloseIcon />
        </button>
      </div>
      <div class="map-modal__wrapper map-modal__wrapper_type_column">
        <InfoCard
          v-for="item in selectedItemsList"
          :key="item.id"
          :item="item"
          :currentCategory="currentCategory"
          :isCardFooterVisible="true"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useCategoryStore } from "../store/modules/category";
import { useFilterStore } from "../store/modules/filter";
import InfoCard from "./info-card.vue";
import CloseIcon from "../assets/icons/close-icon.vue";

/**
 * Панель подробной информации банковского отделения для отображения на мобильных
 *
 * @component
 * @example
 * <MapPanel />
 */
export default defineComponent({
  name: "MapPanel",

  components: {
    InfoCard,
    CloseIcon,
  },

  setup() {
    const startY = ref<number>(0);
    const isModalHeightMax = ref<boolean>(false);

    const categoryStore = useCategoryStore();
    const selectedItemsList = computed(() => categoryStore.selectedItemsList);

    const filterStore = useFilterStore();
    const currentCategory = computed(() => filterStore.currentCategory);

    /**
     * Устанавливает значение параметра, при котором блок с подробной информацией имеет максимально возможную высоту
     * @property {boolean} value
    */
    const setModalHeightMax = (value: boolean) => {
      isModalHeightMax.value = value;
    };

    /**
     * Обрабатывает вертикальную координату касания
     * @property {TouchEvent} event
    */
    const handleTouchStart = (event: TouchEvent) => {
      startY.value = event.touches[0].clientY;
    };

    /**
     * Обрабатывает вертикальную координату касания и изменяет значение параметра, влияющего на высоту блока
     * @property {TouchEvent} event
    */
    const handleTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0].clientY;

      setModalHeightMax(startY.value - currentY > 20);
    };

    /**
     * Если не выбраны объекты данных, изменяем высоту блока с подробной информацией
     * @property {TItemData[]} arr - список выбранных по клику на пин карты объектов
    */
    watch(
      () => selectedItemsList.value,
      (arr) => {
        if (!arr.length) setModalHeightMax(Boolean(arr.length));
        console.log("Подробные данные обновлены", arr);
      }
    );

    return {
      currentCategory,
      selectedItemsList,
      handleTouchMove,
      handleTouchStart,
      setSelectedItemsList: categoryStore.setSelectedItemsList
    }
  },
});
</script>
