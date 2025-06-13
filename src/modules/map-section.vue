<template>
  <div id="map" class="map-section">
    <div class="map-controllers">
      <button class="map-controllers__btn js-zoom-in" type="button">
        <ZoomInIcon class="map-controllers__icon" />
      </button>
      <button class="map-controllers__btn js-zoom-out" type="button">
        <ZoomOutIcon class="map-controllers__icon" />
      </button>
      <button class="map-controllers__btn js-location" type="button">
        <LocationIcon class="map-controllers__icon" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import type {
  TItemData,
  TLocationData,
  TMarkerIcons,
  TMarkerOptions
} from "../utils/types";
import {
  DEFAULT_KEY,
  SELECTED_KEY,
  PARTNER_KEY,
  PARTNER_SELECTED_KEY,
  BEELINE_KEY,
  BEELINE_SELECTED_KEY,
  LXNET_KEY,
  LXNET_SELECTED_KEY,
  MTS_KEY,
  MTS_SELECTED_KEY,
  KARI_KEY,
  KARI_SELECTED_KEY,
  RUPOST_KEY,
  RUPOST_SELECTED_KEY,
  KH_KEY,
  KH_SELECTED_KEY,
  POINT_KEY,
  MAP_PINS,
  LOCATION_KEY,
  COORDS_KEY,
} from "../utils/constants";
import { useCategoryStore } from "../store/modules/category";
import { useFilterStore } from "../store/modules/filter";
import LocationIcon from "../assets/icons/location-icon.vue";
import ZoomInIcon from "../assets/icons/zoom-in-icon.vue";
import ZoomOutIcon from "../assets/icons/zoom-out-icon.vue";
import yMapHandler from "../utils/ymap-handler";

/**
 * Блок с картой
 *
 * @component
 * @example
 * <MapSection />
 */
export default defineComponent({
  name: "MapSection",

  components: {
    LocationIcon,
    ZoomInIcon,
    ZoomOutIcon,
  },

  setup() {
    const mapMarkersList = ref<Partial<TItemData>[]>([]);
    const markerIconSizes = ref<Record<string, number[]>>({
      iconImageSize: [86, 86],
      iconImageOffset: [-43, -86],
    });
    const markerIcons = ref<TMarkerIcons>({
      [DEFAULT_KEY]: {
        [DEFAULT_KEY]: {
          iconImageHref: MAP_PINS[DEFAULT_KEY],
        },
        [PARTNER_KEY]: {
          iconImageHref: MAP_PINS[PARTNER_KEY],
        },
        [BEELINE_KEY]: {
          iconImageHref: MAP_PINS[BEELINE_KEY],
        },
        [LXNET_KEY]: {
          iconImageHref: MAP_PINS[LXNET_KEY],
        },
        [MTS_KEY]: {
          iconImageHref: MAP_PINS[MTS_KEY],
        },
        [KARI_KEY]: {
          iconImageHref: MAP_PINS[KARI_KEY],
        },
        [RUPOST_KEY]: {
          iconImageHref: MAP_PINS[RUPOST_KEY],
        },
        [KH_KEY]: {
          iconImageHref: MAP_PINS[KH_KEY],
        },
      },
      [SELECTED_KEY]: {
        [DEFAULT_KEY]: {
          iconImageHref: MAP_PINS[SELECTED_KEY],
        },
        [PARTNER_KEY]: {
          iconImageHref: MAP_PINS[PARTNER_SELECTED_KEY],
        },
        [BEELINE_KEY]: {
          iconImageHref: MAP_PINS[BEELINE_SELECTED_KEY],
        },
        [LXNET_KEY]: {
          iconImageHref: MAP_PINS[LXNET_SELECTED_KEY],
        },
        [MTS_KEY]: {
          iconImageHref: MAP_PINS[MTS_SELECTED_KEY],
        },
        [KARI_KEY]: {
          iconImageHref: MAP_PINS[KARI_SELECTED_KEY],
        },
        [RUPOST_KEY]: {
          iconImageHref: MAP_PINS[RUPOST_SELECTED_KEY],
        },
        [KH_KEY]: {
          iconImageHref: MAP_PINS[KH_SELECTED_KEY],
        },
      },
    });

    const categoryStore = useCategoryStore();
    /**
     * Основной список объектов
     *
     * @returns {TItemData[]}
    */
    const currentItemsList = computed(() => categoryStore.currentItemsList);
    /**
     * Список выбранных по клику на пин карты объектов
     *
     * @returns {TItemData[]}
    */
    const selectedItemsList = computed(() => categoryStore.selectedItemsList);

    const filterStore = useFilterStore();
    /**
     * Текущие параметры фильтра
     *
     * @returns {TCategoryListData | null}
    */
    const currentCategory = computed(() => filterStore.currentCategory);
    /**
     * Текущее местоположение
     *
     * @returns {TLocationData | null}
    */
    const currentLocation = computed(() => filterStore.currentLocation);

    const isPointsListVisible = computed(() => currentCategory.value && currentCategory?.value.type === POINT_KEY);
    const markerOptions = computed(() => ({
      iconLayout: "default#image",
      ...markerIconSizes.value,
      ...(!isPointsListVisible.value && { ...markerIcons.value[DEFAULT_KEY][DEFAULT_KEY] }),
    }));

    /**
     * Помещает в массив пинов карты список основных объектов
     * @property {TItemData[]} arr - основной список объектов
    */
    const setMapMarkersList = (arr: TItemData[]) => {
      mapMarkersList.value = isPointsListVisible.value
        ? arr
        : arr.map(({ id, coords, isPartner, lon, lat, workingStatus }) => ({
            id,
            coords,
            isPartner,
            isWork: workingStatus.isWork,
            ...(!coords && {coords: [lon, lat].map((value) => Number(value)),
            }),
          }));
    };

    /**
     * Возвращает данные текущей геолокации для отрисовки карты
    */
    const getCurrLocationData = (): Promise<{ isSucceed: boolean; [COORDS_KEY]: number[]; bounds: number[][]; }> => {
      const locationData = localStorage.getItem(LOCATION_KEY);
      const currLocationData: TLocationData | null = locationData ? JSON.parse(locationData) : null;
      const isLocationDataExist: boolean = Boolean(currLocationData) || Boolean(currentLocation.value);

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          isLocationDataExist
            ? resolve({
                isSucceed: true,
                [COORDS_KEY]: currLocationData ? currLocationData[COORDS_KEY] : currentLocation.value[COORDS_KEY],
                bounds: currLocationData ? currLocationData.boundedBy : currentLocation.value.boundedBy,
              })
            : reject({
                isSucceed: false,
                message: "Не удалось получить данные для инициализации карты",
              });
        }, 200);
      });
    };

    /**
     * Выполняет отрисовку карты на основе обновлённого списка объектов
     * @property {TItemData[]} arr - основной список объектов
    */
    const handleYMap = async (arr: Partial<TItemData>[]) => {
      try {
        const { isSucceed, coords, bounds } = await getCurrLocationData();

        if (isSucceed) {
          yMapHandler.renderYMap({
            arr,
            coords,
            bounds,
            config: markerOptions.value as TMarkerOptions,
            icons: markerIcons.value,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    /**
     * При изменении основного списка отделений обновить массив точек карты
     * @property {TItemData[]} arr - основной список объектов
    */
    watch(
      () => currentItemsList.value,
      (arr) => {
        setMapMarkersList(arr);
      }
    );

    /**
     * При изменении списка пинов выполнить обновление карты
     * @property {Partial<TItemData>[]} arr - список точек карты
    */
    watch(
      () => mapMarkersList.value,
      (arr) => {
        handleYMap(arr);
        console.log("Список объектов карты обновлён", arr);
      }
    );

    /**
     * При изменении списка выбранных объектов выполнить обновление объектов карты
     * @property {TItemData[]} arr - список выбранных по клику на пин карты объектов
    */
    watch(
      () => selectedItemsList.value,
      (arr) => {
        yMapHandler.resetPlacemarks(arr);
      }
    );
  },
});
</script>
