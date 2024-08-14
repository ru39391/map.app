<template>
  <div id="map" class="map-section">
    <div class="map-controllers">
      <button class="map-controllers__btn js-zoom-in" type="button">
        <ZoomInIcon />
      </button>
      <button class="map-controllers__btn js-zoom-out" type="button">
        <ZoomOutIcon />
      </button>
      <button class="map-controllers__btn js-location" type="button">
        <LocationIcon />
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import {
  POINT_KEY,
  DEFAULT_KEY,
  CLOSED_KEY,
  SELECTED_KEY,
  SELECTED_CLOSED_KEY,
  PARTNER_KEY,
  PARTNER_SELECTED_KEY,
  BEELINE_KEY,
  MTS_KEY,
  KH_KEY,
  KARI_KEY,
  LXNET_KEY,
  RUPOST_KEY,
  DEFAULT_COORDS,
  DEFAULT_BOUNDS,
  MAP_PINS,
} from "../utils/constants";
import { useCategoryStore } from "../store/modules/category";
import { useLocationStore } from "../store/modules/location";
import LocationIcon from "../assets/icons/location-icon.vue";
import ZoomInIcon from "../assets/icons/zoom-in-icon.vue";
import ZoomOutIcon from "../assets/icons/zoom-out-icon.vue";
import yMapHandler from "../utils/ymap-handler";

export default {
  name: "map-section",

  components: {
    LocationIcon,
    ZoomInIcon,
    ZoomOutIcon,
  },

  data() {
    return {
      mapMarkersList: [],
      markerIconSizes: {
        iconImageSize: [86, 86],
        iconImageOffset: [-43, -86],
      },
      markerIcons: {
        [DEFAULT_KEY]: {
          iconImageHref: MAP_PINS[DEFAULT_KEY],
        },
        [CLOSED_KEY]: {
          iconImageHref: MAP_PINS[CLOSED_KEY],
        },
        [SELECTED_KEY]: {
          iconImageHref: MAP_PINS[SELECTED_KEY],
        },
        [SELECTED_CLOSED_KEY]: {
          iconImageHref: MAP_PINS[SELECTED_CLOSED_KEY],
        },
        [PARTNER_KEY]: {
          iconImageHref: MAP_PINS[PARTNER_KEY],
        },
        [PARTNER_SELECTED_KEY]: {
          iconImageHref: MAP_PINS[PARTNER_SELECTED_KEY],
        },
        [BEELINE_KEY]: {
          iconImageHref: MAP_PINS[BEELINE_KEY],
        },
        [MTS_KEY]: {
          iconImageHref: MAP_PINS[MTS_KEY],
        },
        [KH_KEY]: {
          iconImageHref: MAP_PINS[KH_KEY],
        },
        [KARI_KEY]: {
          iconImageHref: MAP_PINS[KARI_KEY],
        },
        [LXNET_KEY]: {
          iconImageHref: MAP_PINS[LXNET_KEY],
        },
        [RUPOST_KEY]: {
          iconImageHref: MAP_PINS[RUPOST_KEY],
        },
      },
    };
  },

  computed: {
    ...mapState(useCategoryStore, [
      "currentItemsList",
      "selectedItemsList",
      "currentCategory",
    ]),

    ...mapState(useLocationStore, ["currentLocation"]),

    currLocationData() {
      return {
        coords: this.currentLocation
          ? this.currentLocation.coords
          : DEFAULT_COORDS,
        bounds: this.currentLocation
          ? this.currentLocation.boundedBy
          : DEFAULT_BOUNDS,
      };
    },

    isPointsListVisible() {
      return this.currentCategory && this.currentCategory.type === POINT_KEY;
    },

    markerOptions() {
      return {
        iconLayout: "default#image",
        ...this.markerIconSizes,
        ...( !this.isPointsListVisible && { ...this.markerIcons.default } ),
      };
    },
  },

  methods: {
    setMapMarkersList(arr) {
      this.mapMarkersList = this.isPointsListVisible
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
    },
  },

  watch: {
    currentItemsList(arr) {
      this.setMapMarkersList(arr);
    },

    currentCategory(data) {
      console.log("Категория обновлена, map", data);
      this.mapMarkersList = [];
    },

    mapMarkersList(arr) {
      console.log("Список объектов карты обновлён", arr);
      yMapHandler.renderYMap({
        arr,
        ...this.currLocationData,
        config: this.markerOptions,
        icons: this.markerIcons,
      });
    },

    selectedItemsList(arr) {
      yMapHandler.resetPlacemarks(arr);
    },

    currentLocation(data) {
      console.log("Геопозиция обновлена, map", data);
    },
  },
};
</script>
