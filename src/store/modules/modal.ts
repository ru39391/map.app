import { defineStore } from "pinia";
import { ref } from "vue";

const useModalStore = defineStore("modal", () => {
  const isModalOpen = ref<boolean>(false);

  const setModalOpen = (value: boolean) => {
    isModalOpen.value = value;
  };

  return {
    isModalOpen,
    setModalOpen
  };
});

export { useModalStore };
