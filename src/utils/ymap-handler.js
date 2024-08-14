import { setActivePinia } from "pinia";
import { piniaStore } from "../store";
import { useCategoryStore } from "../store/modules/category";
import {
  SELECTED_KEY,
  CLUSTER_KEY,
  CLUSTER_CLOSED_KEY,
  PARTNER_KEY,
  MAP_PINS,
  MAP_ID,
  DEFAULT_KEY,
} from "./constants";

setActivePinia(piniaStore);

const categoryStore = useCategoryStore();

class YMapHandler {
  constructor() {
    this.mapId = MAP_ID;
    this.zoomInBtnSel = ".js-zoom-in";
    this.zoomOutBtnSel = ".js-zoom-out";
    this.setLocBtnSel = ".js-location";
    this.mapItem = null;
    this.iconsData = null;
    this.pinConfig = null;
  }

  initControllers() {
    this.mapWrapper = document.querySelector(`#${this.mapId}`);
    this.zoomInBtn = this.mapWrapper.querySelector(this.zoomInBtnSel);
    this.zoomOutBtn = this.mapWrapper.querySelector(this.zoomOutBtnSel);
    this.setLocBtn = this.mapWrapper.querySelector(this.setLocBtnSel);
  }

  handleSelectedItems(arr, isIconHandlerDisabled = false) {
    const idsArr = arr ? arr.map(({ properties }) => properties._data.id) : [];
    const config = {};

    categoryStore.setSelectedItemsList(idsArr);

    if (!isIconHandlerDisabled) {
      arr.forEach(({ properties, options }) => {
        Object.keys(config).forEach((item, index) => {
          options.set(item, Object.values(config)[index]);
          options.set(
            "iconImageHref",
            this.iconsData[SELECTED_KEY][properties._data.isPartner ? PARTNER_KEY : DEFAULT_KEY]["iconImageHref"]
          );
        });
      });
    }
  }

  hoverPlacemark({ id, key, isClosed, isPartner, options }) {
    //console.log({ id, key, isClosed, options });
    if (categoryStore.selectedItemsList.find((item) => item.id === id)) {
      return;
    }

    const config = {
      ...this.iconsData[SELECTED_KEY][key || DEFAULT_KEY],
      //...( !key && { ...this.iconsData[SELECTED_KEY][key] }),
      ...(isPartner && { ...this.iconsData[SELECTED_KEY][PARTNER_KEY] }),
      iconImageSize: [86, 108],
      iconImageOffset: [-43, -108],
    };

    Object.keys(config).forEach((item, index) => {
      options.set(item, Object.values(config)[index]);
    });
  }

  leavePlacemark({ id, key, isClosed, isPartner, options }) {
    if (categoryStore.selectedItemsList.find((item) => item.id === id)) {
      return;
    }

    const config = key
      ? {
          ...this.pinConfig,
          ...this.iconsData[DEFAULT_KEY][key]
        }
      : {
          ...this.pinConfig,
          ...(isPartner && { ...this.iconsData[DEFAULT_KEY][PARTNER_KEY] }),
        };

    Object.keys(config).forEach((item, index) => {
      options.set(item, Object.values(config)[index]);
    });
  }

  resetPlacemarks(arr) {
    if (!this.mapItem) {
      return;
    }

    let geoObjects = [];
    const idsArr = arr.map(({ id }) => id);

    this.mapItem.geoObjects.each((item) => {
      geoObjects = [
        ...Object.values(item._objects).map(({ geoObject }) => ({
          id: geoObject.properties._data.id,
          key: geoObject.properties._data.key,
          isClosed: geoObject.properties._data.isClosed,
          isPartner: geoObject.properties._data.isPartner,
          options: geoObject.options,
        })),
      ];
    });

    const placemarks = geoObjects.filter(({ id }) => !idsArr.includes(id));

    placemarks.forEach((data) => this.leavePlacemark(data));
  }

  hoverCard(arr, placemarks) {
    const cards = arr.map(({ id }) => ({
      id,
      card: document.querySelector(`#card-${id}`),
    }));
    const targets = placemarks.map(({ properties, options }) => ({
      id: properties._data.id,
      key: properties._data.key,
      isClosed: properties._data.isClosed,
      isPartner: properties._data.isPartner,
      options,
    }));

    cards.forEach(({ id, card }) => {
      card.addEventListener("mouseenter", () => {
        const target = targets.find((item) => item.id === id);

        this.hoverPlacemark(target);
      });

      card.addEventListener("mouseleave", () => {
        const target = targets.find((item) => item.id === id);

        this.leavePlacemark(target);
      });
    });
  }

  isMapItemExist() {
    return Boolean(this.mapItem);
  }

  destroyYMap() {
    if (this.isMapItemExist()) {
      this.mapItem.destroy();
      this.mapItem = null;
      this.iconsData = null;
      this.pinConfig = null;
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        !this.isMapItemExist()
          ? resolve({
              isSucceed: true,
              message: "Карта удалена",
            })
          : reject({
              isSucceed: false,
              message: "Не удалось удалить карту",
            });
      }, 200);
    });
  }

  async loadYMap() {
    let data = { isSucceed: false };

    try {
      const yMaps = await new Promise((resolve) => ymaps.ready(resolve));

      data = { isSucceed: Boolean(yMaps), yMaps };
    } catch (error) {
      console.error(error);
    }

    return data;
  }

  async setMapItem({ coords, bounds }) {
    let data = { isSucceed: false };
    //console.log({ arr, coords, bounds });

    try {
      const res = await Promise.all([this.loadYMap(), this.destroyYMap()]);

      if (res.reduce((acc, { isSucceed }) => acc && isSucceed, true)) {
        const { yMaps } = res.reduce((acc, item) => {
          const key = Object.keys(item).find((key) => key !== "isSucceed");

          return { ...acc, [key]: item[key] };
        }, {});

        this.initControllers();

        const isBounds =
          bounds[0].filter(Boolean).length && bounds[1].filter(Boolean).length;
        let mapState = null;

        if (isBounds) {
          mapState = { coords, bounds, zoom: 12, controls: [] };
        } else {
          mapState = { center: coords, zoom: 12, controls: [] };
        }

        this.mapItem = new yMaps.Map(this.mapId, mapState);
        data = { isSucceed: true, map: this.mapItem, yMaps };
      }
    } catch (error) {
      console.error(error);
    }

    return data;
  }

  async setGeolocation({ ymaps, map }) {
    try {
      const result = await ymaps.geolocation.get();

      if (result && result.geoObjects.getLength() > 0) {
        const { geoObjects } = result;
        map.geoObjects.add(geoObjects);

        const coords = geoObjects.get(0).geometry.getCoordinates();
        map.panTo(coords);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async renderYMap(data) {
    const placemarks = [];
    const { arr, config, icons } = data;
    console.log({config});
    console.log({icons});

    const handlePlacemarkData = (event) => {
      const { properties, options } = event.get("target");
      const { key } = properties._data;

      if (properties.get("geoObjects")) {
        this.handleSelectedItems(properties.get("geoObjects"));
      } else {
        this.handleSelectedItems([{ properties, options }], Boolean(key));
      }

      /*
      const card = document.querySelector(`#card-${properties._data.id}`);
      if(card) {
        card.scrollIntoView({ behavior: 'smooth' });
      }
      */
    };

    const hoverPin = (event) => {
      const { properties, options } = event.get("target");
      const { id, key, isClosed, isPartner } = properties._data;

      if (!properties.get("geoObjects")) {
        this.hoverPlacemark({ id, key, isClosed, isPartner, options });
      }

      /*
      const card = document.querySelector(`#card-${id}`);
      if(card) card.classList.add('is-active');
      */
    };

    const leavePin = (event) => {
      const { properties, options } = event.get("target");
      const { id, key, isClosed, isPartner } = properties._data;

      if (!properties.get("geoObjects")) {
        this.leavePlacemark({ id, key, isClosed, isPartner, options });
      }

      /*
      const card = document.querySelector(`#card-${id}`);
      if(card) card.classList.remove('is-active');
      */
    };

    const handleClusters = (event) => {
      const currentMap = event.get("target");
      const clusters = currentMap.getClusters();

      clusters.forEach((item) => {
        const { properties: clusterProps, options } = item;
        const isClosed = clusterProps
          .get("geoObjects")
          .reduce(
            (acc, { properties }) => acc || properties._data.isClosed,
            false
          );

        //console.log(clusterProps.get('geoObjects').map(({ properties }) => properties._data));
        if (isClosed) {
          options.set("clusterIcons", [
            {
              href: MAP_PINS[CLUSTER_CLOSED_KEY],
              size: [52, 52],
              offset: [-26, -52],
            },
          ]);
        }
      });
    };

    const zoomMap = (map, isZoomIn = true) => {
      const currZoomValue = map.getZoom();
      const zoomValue = isZoomIn ? 1 : -1;

      this.zoomInBtn.disabled = currZoomValue === 23;
      this.zoomOutBtn.disabled = currZoomValue === 0;

      map.setZoom(currZoomValue + zoomValue, { duration: 300 });
    };

    try {
      const { isSucceed, map, yMaps } = await this.setMapItem(data);

      if (isSucceed) {
        const collection = new yMaps.GeoObjectCollection(null, {
          preset: "islands#blackDotIcon",
        });
        const clusterIconContentLayout =
          yMaps.templateLayoutFactory.createClass(
            `<div class="map-cluster {% for item in properties.geoObjects %} {{ item.properties._data.clusterMod}}{% endfor %}">{{ properties.geoObjects.length }}</div>`
          );
        const clusterer = new yMaps.Clusterer({
          preset: "islands#blueClusterIcons",
          clusterIconContentLayout,
          clusterIcons: [
            {
              href: MAP_PINS[CLUSTER_KEY],
              size: [52, 52],
              offset: [-26, -52],
            },
          ],
          groupByCoordinates: false,
          clusterDisableClickZoom: false,
          clusterOpenBalloonOnClick: false,
        });

        arr.forEach(({ id, coords, key, isWork, isPartner }, index) => {
          const placemark = new yMaps.Placemark(
            coords,
            {
              id,
              idx: index,
              key,
              coords,
              isClosed: !key && !isWork && !isPartner,
              isPartner,
              clusterMod: !key && isWork ? "map-cluster__open" : "",
            },
            {
              ...config,
              ...(key && { ...icons[DEFAULT_KEY][key] }),
              ...(isPartner && { ...icons[DEFAULT_KEY][PARTNER_KEY] }),
            }
          );
          clusterer.add(placemark);
          //collection.add(placemark);
          placemarks.push(placemark);
        });

        map.geoObjects.events.add("mouseenter", hoverPin);
        map.geoObjects.events.add("mouseleave", leavePin);
        map.geoObjects.events.add("click", handlePlacemarkData);
        clusterer.events.add("mapchange", handleClusters);

        map.geoObjects.add(clusterer);
        //map.geoObjects.add(collection);

        this.zoomInBtn.addEventListener("click", () => zoomMap(map));
        this.zoomOutBtn.addEventListener("click", () => zoomMap(map, false));
        this.setLocBtn.addEventListener("click", () =>
          this.setGeolocation({ ymaps: yMaps, map })
        );

        this.iconsData = icons;
        this.pinConfig = config;
        this.hoverCard(arr, placemarks);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

const yMapHandler = new YMapHandler();

export default yMapHandler;
