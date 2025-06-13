import { setActivePinia } from "pinia";
import { piniaStore } from "../store";
import { useCategoryStore } from "../store/modules/category";
import {
  SELECTED_KEY,
  CLUSTER_KEY,
  PARTNER_KEY,
  MAP_PINS,
  MAP_ID,
  DEFAULT_KEY,
  DEFAULT_COORDS,
  COORDS_KEY,
} from "./constants";
import {
  TMapClusterData,
  TFilterData,
  THandledData,
  TItemData,
  TLocationData,
  TMapRendererData,
  TMarkerIcons,
  TMarkerOptions
} from "./types";

type TMapData = { map: ymaps.Map; yMaps: typeof window.ymaps; };

type TCardData = { id: string; card: HTMLElement | null; };

setActivePinia(piniaStore);

const categoryStore = useCategoryStore();

class YMapHandler {
  mapId = MAP_ID;
  zoomInBtnSel = ".js-zoom-in";
  zoomOutBtnSel = ".js-zoom-out";
  setLocBtnSel = ".js-location";
  mapItem: TMapData['map'] | null = null;
  mapClusters: TMapClusterData[] = [];
  iconsData: TMarkerIcons | null = null;
  pinConfig: TMarkerOptions | null = null;
  mapWrapper: HTMLElement | null = null;
  zoomInBtn: HTMLButtonElement | null = null;
  zoomOutBtn: HTMLButtonElement | null = null;
  setLocBtn: HTMLButtonElement | null = null;

  constructor() {
  }

  /**
   * Присваивает значение секции карты и основных её контроллеров
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

  /**
   * Обрабатывает клик по метке на карте
   * @property {{ properties: ymaps.IDataManager; options: ymaps.IOptionManager; }[]} arr - массив данных меток
   * @property {boolean} isIconHandlerDisabled - блокировать ли изменение иконок пинов, если метка относится к массиву точек погашения
  */
  handleSelectedItems(
    arr: { properties: ymaps.IDataManager; options: ymaps.IOptionManager; }[],
    isIconHandlerDisabled: boolean = false
  ) {
    const config = {};
    const idsArr = arr
      ? arr.reduce((acc: string[], { properties }) => {
          const id = properties.get('id', { id: undefined });

          return typeof id === 'object' ? acc : [...acc, id as string];
        }, [])
      : [] as string[];

    categoryStore.setSelectedItemsList(idsArr);

    if (!isIconHandlerDisabled) {
      arr.forEach(({ properties, options }) => {
        const isPartnerData = properties.get('isPartner', { isPartner: false });
        const isPartner = typeof isPartnerData === 'object' ? {...isPartnerData as Record<string, boolean>}.isPartner : isPartnerData as boolean;

        Object.entries(config).forEach(([key, value]) => {
          //@ts-ignore
          options.set(key, value);
          //@ts-ignore
          options.set(
            'iconImageHref',
            {...this.iconsData as TMarkerIcons}[SELECTED_KEY][isPartner ? PARTNER_KEY : DEFAULT_KEY]['iconImageHref']
          );
        });
      });
    }
  }

  /**
   * Обрабатывает наведение на метку карты
   * @property {TMapClusterData} data - данные объекта карты
  */
  hoverPlacemark({ id, key, isPartner, options }: TMapClusterData) {
    if(!this.iconsData) {
      return;
    }

    const isItemSelected = categoryStore.selectedItemsList.length === 1;

    if (isItemSelected && categoryStore.selectedItemsList.find((item) => item.id === id)) {
      return;
    }

    const config = {
      ...this.iconsData[SELECTED_KEY][key || DEFAULT_KEY],
      ...(isPartner && { ...this.iconsData[SELECTED_KEY][PARTNER_KEY] }),
      iconImageSize: [86, 108],
      iconImageOffset: [-43, -108],
    };

    //@ts-ignore
    Object.entries(config).forEach(([key, value]) => options.set(key, value));
  }

  /**
   * Обрабатывает прекращение наведения на метку карты
   * @property {TMapClusterData} data - данные объекта карты
  */
  leavePlacemark({ id, key, isPartner, options }: TMapClusterData) {
    if(!this.iconsData) {
      return;
    }

    const isItemSelected = categoryStore.selectedItemsList.length === 1;

    if (isItemSelected && categoryStore.selectedItemsList.find((item) => item.id === id)) {
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

    //@ts-ignore
    Object.entries(config).forEach(([key, value]) => options.set(key, value));
  }

  /**
   * Выполняет обновление объектов карты при изменении списка выбранных объектов в левом сайдбаре
   * @property {TItemData[]} arr - список выбранных объектов
  */
  resetPlacemarks(arr: TItemData[]) {
    if (!this.mapItem) {
      return;
    }

    const idsArr = arr.map(({ id }) => id);
    const placemarks = this.mapClusters.filter(({ id }) => !idsArr.includes(id));

    placemarks.forEach((data) => this.leavePlacemark(data));
  }

  /**
   * Возвращает массив обновлённых после изменения границ карты элементов левого сайдбара
   * @property {TItemData[]} arr - список объектов, соответствующий элементам в текущих границах карты
  */
  setCardElements(arr: TItemData[]): Promise<{ isSucceed: boolean; data: TCardData[]; }> {
    /**
     * Выполняет преобразование данных в объекты, содержащие информацию об элементах левого сайдбара
     * @property {TItemData[]} arr - список объектов, соответствующий элементам в текущих границах карты
    */
    const getCardElements = (array: TItemData[]) => array.reduce(
      (acc: TCardData[], { id }) => {
        const card = id !== undefined
          ? document.querySelector(`#card-${id}`) as HTMLElement | null
          : null;

        return id === undefined ? acc : [...acc, { id, card }];
      },
      []
    );

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isSucceed: true,
          data: getCardElements(arr),
        });
      }, 200);
    });
  }

  /**
   * Устанавливает слушатели меток при наведении на соответствующие карточки в левом сайдбаре
   * после изменения объектов в пределах границ карты
   * @property {TItemData[]} arr - список объектов, соответствующий элементам в текущих границах карты
  */
  async handleCardListeners(arr: TItemData[]) {
    /**
     * Производит выборку объектов по id и устанавливает слушатели соответствующим им меткам
     * @property {TCardData['id']} id - идентификатор объекта
     * @property {TCardData['card']} card - html-элемент карточки в левом сайдбаре
    */
    const setCardListeners = ({ id, card }: TCardData) => {
      if (!card) {
        return;
      }

      card.addEventListener("mouseenter", () => {
        const target = this.mapClusters.find((item) => item.id === id);

        if(target) this.hoverPlacemark(target);
      });

      card.addEventListener("mouseleave", () => {
        const target = this.mapClusters.find((item) => item.id === id);

        if(target) this.leavePlacemark(target);
      });
    };

    try {
      const { isSucceed, data: cards } = await this.setCardElements(arr);

      if (isSucceed) {
        cards.forEach((item) => setCardListeners(item));
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
      this.mapClusters = [];
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
   * Преобразует данные меток в подходящие для обработки объекты
   * @property {ymaps.IGeoObject} item - геообъект метки на карте
  */
  handlePlacemarkItem(item: ymaps.IGeoObject): TMapClusterData {
    const data: Record<string, object> = {
      id: item.properties.get('id', { id: undefined }),
      key: item.properties.get('key', { key: undefined }),
      isPartner: item.properties.get('isPartner', { isPartner: false })
    };

    return {
      ...Object.entries(data).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: typeof value === 'object'
            ? key === 'isPartner' ? value[key] as boolean : value[key] as undefined
            : key === 'isPartner' ? value as boolean : value as string
          }),
        {}
      ),
      lon: item.properties.get('coords', DEFAULT_COORDS)[0],
      lat: item.properties.get('coords', DEFAULT_COORDS)[1],
      options: item.options
    } as TMapClusterData;
  }

  /**
   * По клику на элемент управления перемещает центра карты к определяемому местоположению пользователя
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

  /**
   * Обновляет выборку объектов, отображаемых в пределах текущих границ карты
   * @property {TLocationData['boundedBy']} bounds - текущие границы карты
  */
  updateCustomItems(bounds: TLocationData['boundedBy']) {
    const [leftBound, rightBound] = bounds;
    const items = this.mapClusters.filter(
      (item) => leftBound[0] <= item.lon && item.lon <= rightBound[0] && leftBound[1] <= item.lat && item.lat <= rightBound[1]
    );

    categoryStore.setCustomItemsList(
      items.reduce((acc: string[], { id }) => id === undefined ? acc : [...acc, id], [])
    );
  }

  /**
   * Сместить центр карты согласно новым координатам, если изменился параметр геолокации в фильтре
   * @property {TFilterData[typeof COORDS_KEY] | undefined} coords - обновлённые координаты
  */
  setUpdMapCenter(coords: TFilterData[typeof COORDS_KEY] | undefined) {
    if (!coords || !this.mapItem) {
      return;
    }

    this.mapItem.panTo(coords);
  }

  /**
   * Выполняет преобразование данных элемента карты в объект свойств
   * @property {ymaps.IGeoObject} target - элемент карты
  */
  setGeoObjectProps(target: ymaps.IGeoObject): {
    geoObjects: ymaps.IGeoObject[];
    options: ymaps.IOptionManager;
    properties: ymaps.IDataManager;
    target: ymaps.IGeoObject;
  } {
    const { properties, options } = target;
    const geoObjects = properties.get('geoObjects', []) as ymaps.IGeoObject[];

    return {
      geoObjects,
      options,
      properties,
      target
    }
  }

  /**
   * Выполняет отрисовку карты
   * @property {TMapRendererData} data - данные для отрисовки карты: список объектов, коррдинаты границ и центра, конфигурация иконок пинов
  */
  async renderYMap(data: TMapRendererData) {
    const placemarks = [] as ymaps.Placemark[];
    const { arr, config, icons } = data;

    /**
     * Добавляет карте обработчик события изменения координат её границ
     * @property {ymaps.IEvent} event
    */
    const handleBounds = (event: ymaps.IEvent) => {
      this.updateCustomItems(event.get("newBounds"));
    };

    /**
     * Добавляет карте обработчик клика по метке
     * @property {ymaps.IEvent} event
    */
    const handleClick = (event: ymaps.IEvent) => {
      const {
        geoObjects,
        options,
        properties
      } = this.setGeoObjectProps(event.get("target") as ymaps.IGeoObject);
      const key = properties.get('key', { key: undefined });

      if (geoObjects.length > 0) {
        this.handleSelectedItems(geoObjects.map(({ properties, options }) => ({ properties, options })));
      } else {
        this.handleSelectedItems([{ properties, options }], Boolean(typeof key === 'string'));
      }
    };

    /**
     * Добавляет карте обработчик наведения на метку
     * @property {ymaps.IEvent} event
    */
    const hoverPin = (event: ymaps.IEvent) => {
      const { geoObjects, target } = this.setGeoObjectProps(event.get("target") as ymaps.IGeoObject);
      const data = this.handlePlacemarkItem(target);

      if (geoObjects.length === 0) this.hoverPlacemark(data);
    };

    /**
     * Добавляет карте обработчик прекращения наведения на метку
     * @property {ymaps.IEvent} event
    */
    const leavePin = (event: ymaps.IEvent) => {
      const { geoObjects, target } = this.setGeoObjectProps(event.get("target") as ymaps.IGeoObject);
      const data = this.handlePlacemarkItem(target);

      if (geoObjects.length === 0) this.leavePlacemark(data);
    };

    /**
     * Добавляет обработчик контроллерам уменьшения/увеличения масштаба карты
     * @property {TMapData['map']} map - экземпляр карты
     * @property {boolean} isZoomIn - истинно, если масштаб увеличивается
    */
    const zoomMap = (map: TMapData['map'], isZoomIn: boolean = true) => {
      if(!this.zoomInBtn || !this.zoomOutBtn) {
        return;
      }

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
        const searchControl = new yMaps.control.SearchControl({
          options: { float: "right", floatIndex: 100, noPlacemark: true },
        });

        const clusterIconContentLayout = yMaps.templateLayoutFactory.createClass(`<div class="map-cluster {% for item in properties.geoObjects %} {{ item.properties._data.clusterMod}}{% endfor %}">{{ properties.geoObjects.length }}</div>`);

        const clusterer = new yMaps.Clusterer({
          preset: "islands#blueClusterIcons",
          //@ts-ignore
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

        arr.forEach(({ id, coords, key, isPartner }, index) => {
          const placemark = new yMaps.Placemark(
            coords || DEFAULT_COORDS,
            {
              id,
              idx: index,
              key,
              coords,
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
          placemarks.push(placemark);
        });

        map.controls.add(searchControl);
        //@ts-ignore
        map.geoObjects.add(clusterer);

        map.events.add("boundschange", handleBounds);
        map.geoObjects.events.add("click", handleClick);
        map.geoObjects.events.add("mouseenter", hoverPin);
        map.geoObjects.events.add("mouseleave", leavePin);

        this.iconsData = icons;
        this.pinConfig = config;
        this.mapClusters = clusterer.getGeoObjects().map(item => this.handlePlacemarkItem(item));
        this.updateCustomItems(map.getBounds());

        [{
          item: this.zoomInBtn,
          handleClick: () => zoomMap(map)
        }, {
          item: this.zoomOutBtn,
          handleClick: () => zoomMap(map, false)
        }, {
          item: this.setLocBtn,
          handleClick: () => this.setGeolocation({ ymaps: yMaps, map })
        }].forEach(({ item, handleClick }) => {
          if(item) item.addEventListener("click", handleClick);
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
}

const yMapHandler = new YMapHandler();

export default yMapHandler;
