import { defineStore, setActivePinia } from "pinia";
import { ref } from "vue";
import { piniaStore } from "../index";
import { useCategoryStore } from "./category";
import {
  handleLocationItem,
  setLocation,
  setFilterData,
  changeLocation,
} from "../../utils";
import {
  FILIAL_KEY,
  ATM_KEY,
  POINT_KEY,
  TERMINAL_KEY,
  LOCATION_KEY,
  LOCATION_ID_KEY,
  LOCATION_CODE_KEY,
  COORDS_KEY,
  FILTER_KEY,
  PLACEMARKS_KEY,
  DEFAULT_LOC,
  DEFAULT_LOC_CODE,
  DEFAULT_LOCATION_DATA,
  API_URL,
  DEFAULT_COORDS,
} from "../../utils/constants";
import type {
  TDeptsData,
  TFilterData,
  THandledData,
  TCategoryListData,
  TLocationData
} from "../../utils/types";

setActivePinia(piniaStore);

const categoryStore = useCategoryStore();

const useFilterStore = defineStore("filter", () => {
  const locationList = ref<TLocationData[]>([]);
  const currentLocation = ref<TLocationData | null>(null);
  const categoryList = ref<TCategoryListData[]>([
    { type: FILIAL_KEY, caption: "Отделения", category: "Филиал" },
    { type: ATM_KEY, caption: "Банкоматы", category: "Банкомат" },
    { type: TERMINAL_KEY, caption: "Терминалы", category: "Терминал" },
    { type: POINT_KEY, caption: "Точки погашения", category: "Точка погашения" },
  ]);
  const currentCategory = ref<TCategoryListData | null>(null);
  const categoryFilterData = ref<Omit<TDeptsData, 'placemarks'> | null>(null);
  const currentFilterData = ref<TFilterData | null>(null);

  /**
   * Извлекает данные фильтра из сессии/местоположения из локального хранилища
   * @property {typeof FILTER_KEY | typeof LOCATION_KEY} key - ключ для извлечения данных из локального хранилища
  */
  const getStorageData = (key: typeof FILTER_KEY | typeof LOCATION_KEY): Promise<THandledData<TFilterData | TLocationData>> => {
    const storageData =
      key === FILTER_KEY
        ? sessionStorage.getItem(key)
        : localStorage.getItem(key);
    const data: TFilterData | TLocationData | null = storageData ? JSON.parse(storageData) : null;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isSucceed: true,
          data,
        });
      }, 200);
    });
  };

  /**
   * Помещает в хранилище данные текущего местоположения,
   * конфигурацию фильтра,
   * параметры текущей категории выборки (филиалы/банкоматы/терминалы/точки погашения)
   * @property {TLocationData} locationData - данные текущего местоположения
   * @property {TFilterData} filterData - конфигурация фильтра
  */
  const updateFilterData = (locationData: TLocationData, filterData: TFilterData) => {
    currentLocation.value = locationData;
    currentFilterData.value = filterData;
    currentCategory.value = [...categoryList.value].find(({ type }) => type === filterData.type) || null;
  };

  /**
   * Производит инициализацию для записи в хранилище данных текущего местоположения и параметров фильтра
  */
  const initFilter = async () => {
    const defaultFilterData: TFilterData = {
      [LOCATION_KEY]: DEFAULT_LOC,
      [LOCATION_CODE_KEY]: DEFAULT_LOC_CODE,
      [COORDS_KEY]: DEFAULT_COORDS,
      type: categoryList.value[0].type,
      data: null,
      params: ''
    };

    try {
      const [
        { data: currentLocationData },
        { data: currentFilterData }
      ] = await Promise.all([getStorageData(LOCATION_KEY), getStorageData(FILTER_KEY) ]);
      const currentData = [currentLocationData, currentFilterData].filter((data) => Boolean(data));

      if (currentData.length === 2) {
        updateFilterData(
          currentLocationData as TLocationData,
          currentFilterData as TFilterData
        );
      } else {
        const handledFilterData = currentLocationData as TLocationData | null
          ? {
              ...defaultFilterData,
              ...[LOCATION_KEY, LOCATION_CODE_KEY, COORDS_KEY].reduce(
                (acc, key) => ({ ...acc, [key]: { ...currentLocationData as TLocationData }[key] }),
                {}
              )
            }
          : defaultFilterData;
        const [{ data: locationData }, { data: filterData }] =
          await Promise.all([
            setLocation((currentLocationData || DEFAULT_LOCATION_DATA) as TLocationData),
            setFilterData((currentFilterData || handledFilterData) as TFilterData),
          ]);

        if ([locationData, filterData].reduce((acc, item) => acc && Boolean(item), true)) {
          updateFilterData(
            locationData as TLocationData,
            filterData as TFilterData
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Получает параметры категорий фильтра и список населённых пунктов, где представлен банк, помещает в хранилище
  */
  const setLocationList = async () => {
    categoryStore.isCategoryListLoading = true;

    try {
      const [filterRes, placemarksRes] = await Promise.all([FILTER_KEY, PLACEMARKS_KEY].map((key) => fetch(`${API_URL}${key}`)));

      if(!(filterRes.ok && placemarksRes.ok)) {
        return;
      }

      const [
        filterData,
        placemarksData
      ]: [
        { success: boolean; data: { name: typeof ATM_KEY | typeof FILIAL_KEY | typeof TERMINAL_KEY; props: Record<'name' | 'code', string>[]; }[]; },
        { success: boolean; data: TDeptsData['placemarks']; }
      ] = await Promise.all([filterRes.json(), placemarksRes.json()]);

      if(filterData.success && placemarksData.success) {
        const filterItems = filterData.data.reduce(
          (acc, { name, props }) => ({ ...acc, [name]: props }),
          {} as Omit<TDeptsData, 'placemarks'>
        );

        categoryFilterData.value = [...categoryList.value].reduce(
          (acc, { type }) => (filterItems[type] ? { ...acc, [type]: filterItems[type] } : acc),
          {} as Omit<TDeptsData, 'placemarks'>
        );
        locationList.value = placemarksData.data.map((item) => handleLocationItem(item));
      }
    } catch (error) {
      console.error(error);
    } finally {
      categoryStore.isCategoryListLoading = false;
    }
  };

  /**
   * Изменяет текущую геолокацию и меняет параметры фильтра на соответствующие ей,
   * помещает изменённые данные в хранилище
   * @property {TLocationData} data - обновлённые данные геолокации
  */
  const setCurrentLocation = async (data: TLocationData) => {
    if (currentLocation.value && currentLocation.value[LOCATION_CODE_KEY] === data[LOCATION_CODE_KEY]) {
      return;
    }

    const currentLocationData = locationList.value.find((item) => item[LOCATION_CODE_KEY] === data[LOCATION_CODE_KEY]);

    if(!currentLocationData && !currentFilterData.value) {
      return;
    }

    try {
      const [{ data: locationData }, { data: filterData }] = await Promise.all([
        changeLocation({...currentLocationData as TLocationData}[LOCATION_ID_KEY]),
        setFilterData({
          ...currentFilterData.value as TFilterData,
          [LOCATION_KEY]: data[LOCATION_KEY],
          [LOCATION_CODE_KEY]: data[LOCATION_CODE_KEY],
          [COORDS_KEY]: data[COORDS_KEY],
        }),
      ]);

      if ([locationData, filterData].reduce((acc, item) => acc && Boolean(item), true)) {
        updateFilterData(
          locationData as TLocationData,
          filterData as TFilterData
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Меняет параметры фильтра, перезаписывает данные геолокации,
   * помещает изменённые данные в хранилище
   * @property {TFilterData} data - обновлённые параметры фильтра
  */
  const setCurrentFilterData = async (data: TFilterData) => {
    if(!currentLocation.value) {
      return;
    }

    try {
      const [{ data: locationData }, { data: filterData }] = await Promise.all([
        setLocation(currentLocation.value),
        setFilterData({
          ...data,
          [LOCATION_KEY]: currentLocation.value[LOCATION_KEY],
          [LOCATION_CODE_KEY]: currentLocation.value[LOCATION_CODE_KEY],
          [COORDS_KEY]: currentLocation.value[COORDS_KEY],
        }),
      ]);

      if ([locationData, filterData].reduce((acc, item) => acc && Boolean(item), true)) {
        updateFilterData(
          locationData as TLocationData,
          filterData as TFilterData
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    locationList,
    currentLocation,
    categoryList,
    currentCategory,
    categoryFilterData,
    currentFilterData,
    initFilter,
    setCurrentFilterData,
    setCurrentLocation,
    setLocationList
  };
});

export { useFilterStore };
