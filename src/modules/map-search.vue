<template>
  <div class="map-search-holder">
    <form
      :class="['map-search', { 'is-active': isSearchInputFocused }]"
      @submit.prevent
    >
      <button class="map-search__btn map-search__btn_pe_none" type="button"><SearchIcon /></button>
      <input
        class="map-search__field"
        type="text"
        :placeholder="placeholder"
        v-model="searchValue"
        @focus="setSearchInputFocused(true)"
        @blur="setSearchInputFocused(false)"
      />
      <div class="map-dropdown map-dropdown_type_search" v-if="isResultListOpen">
        <div
          :class="[
            'map-dropdown__wrapper',
            { 'map-dropdown__wrapper_height_min is-active': isResultListOpen }
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
            <span class="map-dropdown__caption">{{ resultItem[param] }}</span>
          </button>
        </div>
      </div>
    </form>
    <div class="map-search-holder__desc" v-if="noResultMess && searchValue && !resultList.length">{{ noResultMess }}</div>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { useCategoryStore } from '../store/modules/category';
  import { useLocationStore } from '../store/modules/location';
  import { useModalStore } from '../store/modules/modal';
  import { LOCATION_CODE_KEY } from '../utils/constants';
  import PinIcon from '../assets/icons/pin-icon.vue';
  import SearchIcon from '../assets/icons/search-icon.vue';

  export default {
    name: 'map-search',

    components: {
      PinIcon,
      SearchIcon
    },

    data() {
      return {
        searchValue: '',
        resultList: [],
        isSearchInputFocused: false
      };
    },

    props: {
      arr: {
        type: Array,
        required: true
      },
      param: {
        type: String,
        required: true
      },
      placeholder: {
        type: String
      },
      noResultMess: {
        type: String
      },
    },

    computed: {
      ...mapState(
        useLocationStore,
        ['locationList', 'currentLocation']
      ),

      ...mapState(useModalStore, ['isModalOpen']),

      isResultListOpen() {
        return this.searchValue && this.resultList.length;
      }
    },

    methods: {
      ...mapActions(useCategoryStore, ['setCurrentItem']),

      ...mapActions(useLocationStore, ['setCurrentLocation']),

      ...mapActions(useModalStore, ['setModalOpen']),

      setSearchInputFocused(value) {
        this.isSearchInputFocused = value;
      },

      handleChange(value) {
        const currValue = value.toLowerCase();

        this.resultList = this.arr.filter(item => {
          const itemValue = item[this.param].toLowerCase();

          return itemValue.includes(currValue);
        });
      },

      handleResultItem(data) {
        const item = data.id ? document.querySelector(`#card-${data.id}`) : null;

        if(data.id) {
          item.scrollIntoView({ behavior: 'smooth' });
          this.setCurrentItem({
            ...data,
            ...(!data.coords && { coords: [Number(data.lon), Number(data.lat)] })
          });
        } else {
          this.setModalOpen(false);

          if(this.currentLocation && data[LOCATION_CODE_KEY] !== this.currentLocation[LOCATION_CODE_KEY]) this.setCurrentLocation(this.locationList, data[LOCATION_CODE_KEY]);
        }

        return new Promise((resolve, reject) => {
          setTimeout(() => {
            data
              ? resolve({
                isSucceed: true,
                ...(data.id ? { item } : { ...data })
              })
              : reject({ isSucceed: false, message: 'Некорректный формат данных' });
          }, 200);
        });
      },

      async resetResultList(data) {
        try {
          const { isSucceed } = await this.handleResultItem(data);

          if(isSucceed) {
            this.resultList = [];
          }
        } catch (error) {
          console.error(error);
        }
      },
    },

    watch: {
      searchValue(value) {
        this.handleChange(value);
      },

      isModalOpen() {
        this.searchValue = '';
      }
    }
  };
</script>
