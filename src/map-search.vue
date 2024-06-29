<template>
  <form
    :class="['map-search', { 'is-active': isSearchInputFocused }]"
    @submit.prevent
  > <!-- ref={searchDropdownRef} -->
    <button class="map-search__btn map-search__btn_pe_none" type="button"><SearchIcon /></button>
    <input
      class="map-search__field"
      type="text"
      :placeholder="placeholder"
      v-model="location"
      @focus="setSearchInputFocused(true)"
      @blur="setSearchInputFocused(false)"
    />
    <div class="map-dropdown" v-if="isResultListOpen">
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
          @click="handleResultItem(resultItem)"
        >
          <PinIcon />
          <span class="map-dropdown__caption">{{ resultItem }}</span>
        </button>
      </div>
    </div>
  </form>
  <template v-if="location && !resultList.length">{{ noResultMess }}</template>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { useLocationStore } from './store/modules/location';
  import { useModalStore } from './store/modules/modal';
  import PinIcon from './assets/icons/pin-icon.vue';
  import SearchIcon from './assets/icons/search-icon.vue';

  export default {
    name: 'map-search',

    components: {
      PinIcon,
      SearchIcon
    },

    data() {
      return {
        location: '',
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
        return this.location && this.resultList.length;
      }
    },

    methods: {
      ...mapActions(useLocationStore, ['setCurrentLocation']),

      ...mapActions(useModalStore, ['setModalOpen']),

      setSearchInputFocused(value) {
        this.isSearchInputFocused = value;
      },

      handleChange(value) {
        const currValue = value.toLowerCase();
        const handledArr = this.arr.filter(item => {
          const itemValue = item[this.param].toLowerCase();

          return itemValue.includes(currValue);
        });

        this.resultList = handledArr.map(item => item[this.param]);
      },

      handleResultItem(value) {
        this.setModalOpen(false);

        if(this.currentLocation && value !== this.currentLocation.location) this.setCurrentLocation(value);
      },
    },

    watch: {
      location(value) {
        this.handleChange(value);
      },

      isModalOpen() {
        this.location = '';
        this.resultList = [];
      }
    },
  };
</script>
