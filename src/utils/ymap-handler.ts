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
  DEFAULT_COORDS,
  COORDS_KEY,
} from "./constants";
import {
  THandledData,
  TLocationData
} from "./types";
import { IGeometry } from "yandex-maps";

type TMapData = { map: ymaps.Map; yMaps: typeof window.ymaps; };

setActivePinia(piniaStore);

const categoryStore = useCategoryStore();
// TODO: выполнить типизацию
class YMapHandler {
  mapId = MAP_ID;
  zoomInBtnSel = ".js-zoom-in";
  zoomOutBtnSel = ".js-zoom-out";
  setLocBtnSel = ".js-location";
  mapItem: TMapData['map'] | null = null;
  iconsData = null;
  pinConfig = null;
  mapWrapper: HTMLElement | null = null;
  zoomInBtn: HTMLElement | null = null;
  zoomOutBtn: HTMLElement | null = null;
  setLocBtn: HTMLElement | null = null;

  constructor() {
    this.initControllers();
  }

  /**
   * Выполняет инициализацию карты
  */
  initControllers() {
    this.mapWrapper = document.querySelector(`#${this.mapId}`);

    if(!this.mapWrapper) {
      return;
    }

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
            this.iconsData[SELECTED_KEY][
              properties._data.isPartner ? PARTNER_KEY : DEFAULT_KEY
            ]["iconImageHref"]
          );
        });
      });
    }
  }

  hoverPlacemark({ id, key, isPartner, options }) {
    const isItemSelected = categoryStore.selectedItemsList.length === 1;

    if (
      isItemSelected &&
      categoryStore.selectedItemsList.find((item) => item.id === id)
    ) {
      return;
    }

    const config = {
      ...this.iconsData[SELECTED_KEY][key || DEFAULT_KEY],
      ...(isPartner && { ...this.iconsData[SELECTED_KEY][PARTNER_KEY] }),
      iconImageSize: [86, 108],
      iconImageOffset: [-43, -108],
    };

    Object.keys(config).forEach((item, index) => {
      options.set(item, Object.values(config)[index]);
    });
  }

  leavePlacemark({ id, key, isPartner, options }) {
    const isItemSelected = categoryStore.selectedItemsList.length === 1;

    if (
      isItemSelected &&
      categoryStore.selectedItemsList.find((item) => item.id === id)
    ) {
      return;
    }

    const config = key
      ? {
          ...this.pinConfig,
          ...this.iconsData[DEFAULT_KEY][key],
        }
      : {
          ...this.pinConfig,
          ...(isPartner && { ...this.iconsData[DEFAULT_KEY][PARTNER_KEY] }),
        };

    Object.keys(config).forEach((item, index) => {
      options.set(item, Object.values(config)[index]);
    });
  }

  getGeoObjects(map) {
    if (!map) {
      return [];
    }

    let geoObjects = [];

    map.geoObjects.each((item) => {
      geoObjects = [
        ...Object.values(item._objects).map(({ geoObject }) => ({
          id: geoObject.properties._data.id,
          key: geoObject.properties._data.key,
          lon: geoObject.properties._data.coords[0],
          lat: geoObject.properties._data.coords[1],
          isClosed: geoObject.properties._data.isClosed,
          isPartner: geoObject.properties._data.isPartner,
          options: geoObject.options,
        })),
      ];
    });

    return geoObjects;
  }

  resetPlacemarks(arr) {
    if (!this.mapItem) {
      return;
    }

    const idsArr = arr.map(({ id }) => id);
    const placemarks = this.getGeoObjects(this.mapItem).filter(
      ({ id }) => !idsArr.includes(id)
    );

    placemarks.forEach((data) => this.leavePlacemark(data));
  }

  setCardElements(arr) {
    const getCardElements = (array) =>
      array.map(({ id }) => ({
        id,
        card: document.querySelector(`#card-${id}`),
      }));

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isSucceed: true,
          data: getCardElements(arr),
        });
      }, 200);
    });
  }

  async handleCardsList(arr) {
    const setCardListeners = ({ id, card }, placemarks) => {
      if (!card) {
        return;
      }

      card.addEventListener("mouseenter", () => {
        const target = placemarks.find((item) => item.id === id);

        this.hoverPlacemark(target);
      });

      card.addEventListener("mouseleave", () => {
        const target = placemarks.find((item) => item.id === id);

        this.leavePlacemark(target);
      });
    };

    try {
      const { isSucceed, data: cards } = await this.setCardElements(arr);

      if (isSucceed) {
        cards.forEach((item) =>
          setCardListeners(item, this.getGeoObjects(this.mapItem))
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Проверяет существование экземпляра карты
  */
  isMapItemExist(): boolean {
    return Boolean(this.mapItem);
  }

  /**
   * Удаляет ранее созданный объект карты перед отрисовкой нового экземпляра
  */
  destroyYMap(): Promise<Record<'isSucceed' | 'isMapItemExist', boolean> & { message: string; }> {
    if (this.mapItem) {
      this.mapItem.destroy();
      this.mapItem = null;
      this.iconsData = null;
      this.pinConfig = null;
    }
    console.log({ mapItem: this.mapItem });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        !this.isMapItemExist()
          ? resolve({
              isSucceed: true,
              isMapItemExist: this.isMapItemExist(),
              message: "Карта удалена",
            })
          : reject({
              isSucceed: false,
              isMapItemExist: this.isMapItemExist(),
              message: "Не удалось удалить карту",
            });
      }, 200);
    });
  }

  /**
   * Возвращает объект Я.Карт ymaps после успешной загрузки
  */
  async loadYMap(): Promise<THandledData<typeof window.ymaps>> {
    let res: THandledData<typeof window.ymaps> = { isSucceed: false, data: null };
    const { ymaps } = window;

    try {
      const data: typeof ymaps = await new Promise((resolve) => ymaps.ready(resolve as () => any));

      res = { isSucceed: Boolean(data), data };
    } catch (error) {
      console.error(error);
    }

    return res;
  }

  /**
   * Выполняет проверку удаления ранее отрисованной карты и создание экземпляра новой,
   * возвращает экземпляр новой карты
   * @property {number[]} coords - координаты центра карты
   * @property {number[][]} bounds - координаты крайних точек карты
  */
  async setMapItem(
    {
      coords,
      bounds
    }: Pick<TLocationData, typeof COORDS_KEY> & { bounds: TLocationData['boundedBy']; }
  ) {
    let data: THandledData<TMapData> = { isSucceed: false, data: null };

    try {
      const res = await Promise.all([this.loadYMap(), this.destroyYMap()]);
      const { data: yMaps } = res[0];

      if (yMaps && res.reduce((acc, { isSucceed }) => acc && isSucceed, true)) {
        this.initControllers();

        const isBounds = bounds[0].filter(Boolean).length && bounds[1].filter(Boolean).length;

        this.mapItem = new yMaps.Map(
          this.mapId,
          { center: coords, zoom: 12, controls: [], ...( isBounds && { bounds }) }
        );

        data = { isSucceed: true, data: { map: this.mapItem, yMaps } };
      }
    } catch (error) {
      console.error(error);
    }

    return data;
  }

  /**
   * По клику на кнопку перемещает центра карты к определяемому местоположению пользователя
   * @property {TMapData['yMaps']} ymaps - объект Я.Карт
   * @property {TMapData['map']} map - экземпляр карты
  */
  async setGeolocation({ ymaps, map }: { ymaps: TMapData['yMaps']; } & Pick<TMapData, 'map'>) {
    try {
      const result = await ymaps.geolocation.get();

      if (result && result.geoObjects.getLength() > 0) {
        const { geoObjects } = result;
        const coords = geoObjects.get(0).geometry?.getBounds();

        map.panTo(Array.isArray(coords) ? coords[0] : DEFAULT_COORDS);
      }
    } catch (error) {
      console.log(error);
    }
  }

  updateCustomItems({ bounds, pins }) {
    const [leftBound, rightBound] = bounds;
    const items = pins.filter(
      (item) =>
        leftBound[0] <= item.lon &&
        item.lon <= rightBound[0] &&
        leftBound[1] <= item.lat &&
        item.lat <= rightBound[1]
    );

    categoryStore.setCustomItemsList(items.map(({ id }) => id));
  }

  async renderYMap(data) {
    const placemarks = [];
    const { arr, config, icons } = data;

    const handleBounds = (event) => {
      const map = event.get("target");

      this.updateCustomItems({
        bounds: event.get("newBounds"),
        pins: this.getGeoObjects(map),
      });
    };

    const handlePlacemarkData = (event) => {
      const { properties, options } = event.get("target");
      const { key } = properties._data;

      if (properties.get("geoObjects")) {
        this.handleSelectedItems(properties.get("geoObjects"));
      } else {
        this.handleSelectedItems([{ properties, options }], Boolean(key));
      }
    };

    const hoverPin = (event) => {
      const { properties, options } = event.get("target");
      const { id, key, isClosed, isPartner } = properties._data;

      if (!properties.get("geoObjects")) {
        this.hoverPlacemark({ id, key, isClosed, isPartner, options });
      }
    };

    const leavePin = (event) => {
      const { properties, options } = event.get("target");
      const { id, key, isClosed, isPartner } = properties._data;

      if (!properties.get("geoObjects")) {
        this.leavePlacemark({ id, key, isClosed, isPartner, options });
      }
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
      const { isSucceed, data: mapData } = await this.setMapItem(data);

      if (isSucceed && mapData) {
        const { map, yMaps } = mapData;
        const collection = new yMaps.GeoObjectCollection(null, {
          preset: "islands#blackDotIcon",
        });
        const searchControl = new yMaps.control.SearchControl({
          options: {
            float: "right",
            floatIndex: 100,
            noPlacemark: true,
          },
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
              clusterMod: key ? "map-cluster_type_point" : "",
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

        map.events.add("boundschange", handleBounds);
        map.geoObjects.events.add("mouseenter", hoverPin);
        map.geoObjects.events.add("mouseleave", leavePin);
        map.geoObjects.events.add("click", handlePlacemarkData);
        clusterer.events.add("mapchange", handleClusters);

        map.controls.add(searchControl);
        map.geoObjects.add(clusterer);
        //map.geoObjects.add(collection);

        this.zoomInBtn.addEventListener("click", () => zoomMap(map));
        this.zoomOutBtn.addEventListener("click", () => zoomMap(map, false));
        this.setLocBtn.addEventListener("click", () =>
          this.setGeolocation({ ymaps: yMaps, map })
        );

        this.iconsData = icons;
        this.pinConfig = config;
        this.updateCustomItems({
          bounds: map.getBounds(),
          pins: this.getGeoObjects(map),
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
}

const yMapHandler = new YMapHandler();

export default yMapHandler;
