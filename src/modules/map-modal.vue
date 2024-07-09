<template>
  <div class="map-overlay map-overlay_type_holder" v-if="isModalOpen" @click.self="setModalOpen(false)">
    <div :class="['map-modal', { 'is-active': isModalOpen }]">
      <button class="map-modal__close" type="button" @click="setModalOpen(false)"><CloseIcon /></button>
      <div class="map-modal__header">
        <div class="map-modal__title" v-if="modalTitle">{{ modalTitle }}</div>
        <slot name="header"></slot>
      </div>
      <div class="map-modal__wrapper" v-if="$slots.wrapper">
        <div class="map-modal__subtitle" v-if="modalSubtitle">{{ modalSubtitle }}</div>
        <slot name="wrapper"></slot>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { useModalStore } from '../store/modules/modal';
  import CloseIcon from '../assets/icons/close-icon.vue';

  export default {
    name: 'map-modal',

    components: {
      CloseIcon
    },

    props: {
      modalTitle: {
        type: String
      },
      modalSubtitle: {
        type: String
      }
    },

    computed: {
      ...mapState(useModalStore, ['isModalOpen']),
    },

    methods: {
      ...mapActions(useModalStore, ['setModalOpen']),
    }
  };
</script>
