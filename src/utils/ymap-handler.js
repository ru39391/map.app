import { setActivePinia } from 'pinia';
import { piniaStore } from '../store';
import { useCategoryStore } from '../store/modules/category';
import { CLOSED_KEY, MAP_ID } from './constants';

setActivePinia(piniaStore);

const categoryStore = useCategoryStore();

class YMapHandler {
  constructor() {
    this.mapId = MAP_ID;
    this.mapItem = null;
    this.iconsData = null;
    this.pinConfig = null;
  }

  setCardData(data) {
    const item = categoryStore.currentItemsList.find(({ id }) => id === data.id);

    categoryStore.setCurrentItem(item ? { ...item, coords: data.coords } : null);
  }

  hoverPlacemark(options, key) {
    options.set('iconImageSize', key ? [48, 48] : [66, 94]);
    options.set('iconImageOffset', key ? [-24, -48] : [-33, -94]);
  }

  leavePlacemark(options, key, isClosed) {
    const data = key ? { ...this.pinConfig, ...this.iconsData[key] } : { ...this.pinConfig, ...(isClosed && { ...this.iconsData[CLOSED_KEY] }) };

    Object.keys(data).forEach((item, index) => {
      options.set(item, Object.values(data)[index]);
    });
  }

  selectPlacemark(arr, placemarks) {
    const cards = arr.map(({ id }) => ({ id, card: document.querySelector(`#card-${id}`) }));
    const targets = placemarks.map(
      ({ properties, options }) => ({
        id: properties._data.id,
        key: properties._data.key,
        isClosed: properties._data.isClosed,
        options
      })
    );

    cards.forEach(({ id, card }) => {
      card.addEventListener('mouseenter', () => {
        const target = targets.find(item => item.id === id);

        this.hoverPlacemark(target.options, target.key);
      });

      card.addEventListener('mouseleave', () => {
        const target = targets.find(item => item.id === id);

        this.leavePlacemark(target.options, target.key, target.isClosed);
      });
    })
  }

  isMapItemExist() {
    return Boolean(this.mapItem);
  }

  destroyYMap() {
    if(this.isMapItemExist()) {
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
            message: 'Карта удалена'
          })
          : reject({
            isSucceed: false,
            message: 'Не удалось удалить карту'
          })
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

      if(res.reduce((acc, { isSucceed }) => acc && isSucceed, true)) {
        const { yMaps } = res.reduce((acc, item) => {
          const key = Object.keys(item).find(key => key !== 'isSucceed');

          return { ...acc, [key]: item[key] };
        }, {});

        this.mapItem = new yMaps.Map(this.mapId, { coords, bounds, zoom: 11, controls: [] });
        data = { isSucceed: true, map: this.mapItem, yMaps };
      }
    } catch (error) {
      console.error(error);
    }

    return data;
  }

  async renderYMap(data) {
    const placemarks = [];
    const { arr, config, icons } = data;

    const scrollToCard = (event) => {
      const { properties } = event.get('target');
      const card = document.querySelector(`#card-${properties._data.id}`);

      card.scrollIntoView({ behavior: 'smooth' });
      this.setCardData({ ...properties._data });
    };

    const hoverPin = (event) => {
      const { properties, options } = event.get('target');
      const { key } = properties._data;

      this.hoverPlacemark(options, key);
    };

    const leavePin = (event) => {
      const { properties, options } = event.get('target');
      const { key, isClosed } = properties._data;

      this.leavePlacemark(options, key, isClosed);
    };

    try {
      const { isSucceed, map, yMaps } = await this.setMapItem(data);

      if(isSucceed) {
        const collection = new yMaps.GeoObjectCollection(null, { preset: 'islands#blackDotIcon' });

        arr.forEach(({ id, coords, key, isWork }, index) => {
          const placemark = new yMaps.Placemark(
            coords,
            {
              id,
              idx: index,
              key,
              coords,
              isClosed: !key && !isWork
            },
            {
              ...config,
              ...(key && { ...icons[key] }),
              ...(!key && !isWork && { ...icons[CLOSED_KEY] } )
            }
          );
          collection.add(placemark);
          placemarks.push(placemark);
        });

        map.geoObjects.events.add('mouseenter', hoverPin);
        map.geoObjects.events.add('mouseleave', leavePin);
        map.geoObjects.events.add('click', scrollToCard);
        map.geoObjects.add(collection);

        this.iconsData = icons;
        this.pinConfig = config;
        this.selectPlacemark(arr, placemarks);
      };
    } catch (error) {
      console.error(error);
    }
  }
}

const yMapHandler = new YMapHandler();

export default yMapHandler;
