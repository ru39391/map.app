<template>
  <div class="map-overlay" v-if="isModalOpen">
    <div :class="['map-modal', { 'map-modal_active': isModalOpen }]"> <!-- ref={modalRef} -->
      <button class="map-modal__close" type="button" @click="setModalOpen(false)">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M7.6176 9L0 1.3824L1.3824 0L9 7.6176L16.6176 0L18 1.3824L10.3824 9L18 16.6176L16.6176 18L9 10.3824L1.3824 18L0 16.6176L7.6176 9Z" fill="#0D0D0D"/>
        </svg>
      </button>
      <div className="map-modal__header">
        <div className="map-modal__title" v-if="modalTitle">{{ modalTitle }}</div>
        <slot name="header"></slot>
      </div>
      <div className="map-modal__wrapper" v-if="$slots.wrapper">
        <slot name="wrapper"></slot>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'pinia';
  import { useModalStore } from './store/modules/modal';

  export default {
    name: 'map-modal',

    data() {
      return {
      };
    },

    props: {
      modalTitle: {
        type: String
      }
    },

    computed: {
      ...mapState(
        useModalStore,
        [
          'isModalOpen'
        ]
      ),
    },

    methods: {
      ...mapActions(
        useModalStore,
        [
          'setModalOpen'
        ]
      ),
    }
  };
</script>
