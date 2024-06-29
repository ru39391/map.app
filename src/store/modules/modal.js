import { defineStore } from 'pinia';

const useModalStore = defineStore({
  id: 'modal',
  state: () => ({
    isModalOpen: true
  }),
  actions: {
    setModalOpen(value) {
      this.isModalOpen = value;
    }
  },
});

export {
  useModalStore
}
