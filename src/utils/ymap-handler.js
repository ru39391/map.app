import { CLOSED_KEY, MAP_ID } from './constants';

class YMapHandler {
  constructor() {
    this.mapId = MAP_ID;
    this.mapItem = null;
  }

  isMapItemExist() {
    return Boolean(this.mapItem);
  }

  destroyYMap() {
    if(this.isMapItemExist()) {
      this.mapItem.destroy();
      this.mapItem = null;
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
        console.log(res);
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
    const { arr, config, icons } = data;
    console.log({ config, icons });

    const scrollToCard = (event) => {
      const { properties, options } = event.get('target');
      const card = document.querySelector(`#card-${properties._data.id}`);

      card.scrollIntoView({ behavior: 'smooth' });
      console.log(options);
    };

    const hoverPin = (event) => {
      const { properties, options } = event.get('target');
      const { key } = properties._data;

      if(key) {
        options.set('iconImageSize', [48, 48]);
      }
    };

    const leavePin = (event) => {
      const { properties, options } = event.get('target');
      const { key } = properties._data;
      const data = key ? { ...config, ...icons[key] } : { ...config };

      Object.keys(data).forEach((item, index) => {
        options.set(item, Object.values(data)[index]);
      });
    };

    try {
      const { isSucceed, map, yMaps } = await this.setMapItem(data);

      if(isSucceed) {
        const collection = new yMaps.GeoObjectCollection(null, { preset: 'islands#blackDotIcon' });

        arr.forEach(({ id, coords, key, workingStatus }, index) => {
          collection.add(
            new yMaps.Placemark(
              coords,
              {
                id,
                idx: index,
                key
              },
              {
                ...config,
                ...(key && { ...icons[key] }),
                ...(!key && workingStatus && !workingStatus.isWork && { ...icons[CLOSED_KEY] } )
              }
            )
          );
        });

        map.geoObjects.events.add('mouseenter', hoverPin);
        map.geoObjects.events.add('mouseleave', leavePin);
        map.geoObjects.events.add('click', scrollToCard);
        map.geoObjects.add(collection);
      };
    } catch (error) {
      console.error(error);
    }
  }
}

const yMapHandler = new YMapHandler();

export default yMapHandler;
