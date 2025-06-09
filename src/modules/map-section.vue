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
    const mapMarkersList = ref<Record<string, string>[]>([]);
    const markerIconSizes = ref<Record<string, number[]>>({
      iconImageSize: [86, 86],
      iconImageOffset: [-43, -86],
    });
    const markerIcons = ref<Record<string, Record<string, string>>>({
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
    const filterStore = useFilterStore();
    const currentItemsList = computed(() => categoryStore.currentItemsList);
    const selectedItemsList = computed(() => categoryStore.selectedItemsList);
    const currentCategory = computed(() => filterStore.currentCategory);
    const currentLocation = computed(() => filterStore.currentLocation);

    const isPointsListVisible = computed(
      () => currentCategory.value && currentCategory?.value.type === POINT_KEY
    );
    const markerOptions = computed(() => ({
      iconLayout: "default#image",
      ...markerIconSizes.value,
      ...(!isPointsListVisible.value && {
        ...markerIcons.value[DEFAULT_KEY][DEFAULT_KEY],
      }),
    }));

    const setMapMarkersList = (arr) => {
      mapMarkersList.value = isPointsListVisible.value
        ? arr
        : arr.map(({ id, coords, isPartner, lon, lat, workingStatus }) => ({
            id,
            coords,
            isPartner,
            isWork: workingStatus.isWork,
            ...(!coords && {
              coords: [lon, lat].map((value) => Number(value)),
            }),
          }));
    };

    const getCurrLocationData = () => {
      const locationData = localStorage.getItem(LOCATION_KEY);
      const currLocationData = locationData ? JSON.parse(locationData) : null;
      const isLocationDataExist = currLocationData || currentLocation.value;

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          isLocationDataExist
            ? resolve({
                isSucceed: true,
                [COORDS_KEY]: currLocationData
                  ? currLocationData[COORDS_KEY]
                  : currentLocation.value[COORDS_KEY],
                bounds: currLocationData
                  ? currLocationData.boundedBy
                  : currentLocation.value.boundedBy,
              })
            : reject({
                isSucceed: false,
                message: "Не удалось получить данные для инициализации карты",
              });
        }, 200);
      });
    };

    const handleYMap = async (arr) => {
      try {
        const { isSucceed, coords, bounds } = await getCurrLocationData();

        if (isSucceed) {
          yMapHandler.renderYMap({
            arr,
            coords,
            bounds,
            config: markerOptions.value,
            icons: markerIcons.value,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    watch(
      () => currentItemsList.value,
      (arr) => {
        setMapMarkersList(arr);
      }
    );

    watch(
      () => mapMarkersList.value,
      (arr) => {
        handleYMap(arr);
        console.log("Список объектов карты обновлён", arr);
      }
    );

    watch(
      () => selectedItemsList.value,
      (arr) => {
        yMapHandler.resetPlacemarks(arr);
      }
    );
  },
});
</script>
