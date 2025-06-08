<template>
  <div class="map-search-holder">
    <form
      :class="['map-search', { 'is-active': isSearchInputFocused }]"
      @submit.prevent
    >
      <button class="map-search__btn" type="button">
        <SearchIcon />
      </button>
      <input
        class="map-search__field"
        type="text"
        :placeholder="placeholder"
        v-model="searchValue"
        @focus="setSearchInputFocused(true)"
        @blur="setSearchInputFocused(false)"
      />
      <div
        class="map-dropdown map-dropdown_type_search"
        v-if="isResultListOpen"
      >
        <div
          :class="[
            'map-dropdown__wrapper',
            { 'map-dropdown__wrapper_height_min is-active': isResultListOpen },
          ]"
        >
          <button
            v-for="(resultItem, index) in resultList"
            :key="index"
            class="map-dropdown__item"
            type="button"
            @click="resetResultList(resultItem)"
          >
            <PinIcon class="map-dropdown__icon" />
            <span
              class="map-dropdown__caption"
              v-html="resultItem[param]"
            ></span>
          </button>
        </div>
      </div>
    </form>
    <div
      class="map-search-holder__desc"
      v-if="noResultMess && searchValue && !resultList.length"
    >
      {{ noResultMess }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import type {
  TItemData,
  TLocationData
} from "../utils/types";
import { useCategoryStore } from "../store/modules/category";
import { useFilterStore } from "../store/modules/filter";
import { useModalStore } from "../store/modules/modal";
import { LOCATION_KEY, LOCATION_CODE_KEY } from "../utils/constants";
import PinIcon from "../assets/icons/pin-icon.vue";
import SearchIcon from "../assets/icons/search-icon.vue";

export default defineComponent({
  name: "MapSearch",

  components: {
    PinIcon,
    SearchIcon,
  },

  props: {
    arr: {
      type: Array,
      required: true,
    },
    param: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
    },
    noResultMess: {
      type: String,
    },
  },

  setup(props) {
    const searchValue = ref<string>('');
    const resultList = ref<TLocationData[] | TItemData[]>([]);
    const isSearchInputFocused = ref<boolean>(false);

    const categoryStore = useCategoryStore();
    const filterStore = useFilterStore();
    const currentLocation = computed(() => filterStore.currentLocation);

    const modalStore = useModalStore();
    const isModalOpen = computed(() => modalStore.isModalOpen);

    const isResultListOpen = computed(() => searchValue.value && resultList.value.length);

    /**
     * Устанавливает истинное значение, если производится ввод в поле поиска
     * @property {boolean} value
    */
    const setSearchInputFocused = (value: boolean) => {
      isSearchInputFocused.value = value;
    };

    /**
     * Ищет совпадения по мере ввода в поле
     * @property {string} value - вводимое значение
    */
    const handleChange = (value: string) => {
      const currValue = value.toLowerCase();

      resultList.value = [...props.arr as TLocationData[] | TItemData[]].reduce((acc, item) => {
        const regex = new RegExp(value, "gi");
        const itemValue: string = item[props.param].toLowerCase();

        return itemValue.includes(currValue)
          ? [
              ...acc,
              {
                ...item,
                [props.param]: item[props.param].replace(
                  regex,
                  (match: string) => `<span class="map-dropdown__highlight">${match}</span>`
                ),
              },
            ]
          : acc;
      }, []);
    };

    /**
     * Устанавливает список карточек с совпадающим значением или обновляет геолокацию:
     * в зависимости от типа входящих данных
     * @property {TLocationData | TItemData} data
    */
    const handleResultItem = (data: TLocationData | TItemData): Promise<{ isSucceed: boolean; }> => {
      if ({...data as TItemData}.id) {
        categoryStore.setSelectedItemsList([{...data as TItemData}.id]);
      } else {
        modalStore.setModalOpen(false);

        if (currentLocation.value && data[LOCATION_CODE_KEY] !== currentLocation.value[LOCATION_CODE_KEY]) {
          filterStore.setCurrentLocation({
            ...data as TLocationData,
            [LOCATION_KEY]: {...data as TLocationData}[LOCATION_KEY].replace(/[^А-Яа-яЁё]/g, "")
          });
        }
      }

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          data ? resolve({ isSucceed: true }) : reject({ isSucceed: false });
        }, 200);
      });
    };

    /**
     * Сбрасывает список результатов поиска
     * @property {TLocationData | TItemData} data
    */
    const resetResultList = async (data: TLocationData | TItemData) => {
      try {
        const { isSucceed } = await handleResultItem(data);

        if (isSucceed) {
          resultList.value = [];
        }
      } catch (error) {
        console.error(error);
      }
    };

    watch(
      () => searchValue.value,
      (value) => {
        handleChange(value);
      }
    );

    watch(
      () => isModalOpen.value,
      () => {
        searchValue.value = "";
      }
    );

    return {
      searchValue,
      resultList,
      isSearchInputFocused,
      isResultListOpen,
      resetResultList,
      setSearchInputFocused,
    }
  },
});
</script>
