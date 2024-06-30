<template>
  <div className="map-filter"> <!--  ref={filterDropdownRef} -->
    <button className="map-filter__toggler" type="button"><FilterIcon /></button>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import FilterIcon from './assets/icons/filter-icon.vue';

  export default {
    name: 'map-filter',

    components: {
      FilterIcon
    },

    props: {
    },

    computed: {
    },

    methods: {
    }
  };
</script>
