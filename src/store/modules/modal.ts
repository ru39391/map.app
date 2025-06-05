import { defineStore } from "pinia";
import { ref } from "vue";

const useFilterStore = defineStore("modal", () => {
  const isModalOpen = ref<boolean>(false);

  const setModalOpen = (value: boolean) => {
    isModalOpen.value = value;
  };

  return {
    isModalOpen,
    setModalOpen
  };
});

export { useFilterStore };
