import { createApp } from 'vue'
import { piniaStore } from './store';
import YmapPlugin from 'vue-yandex-maps'

import './style.css'
import './styles/_import.scss'

import App from './App.vue'

const app = createApp(App);
const ymapConfig = {
  apiKey: 'b4274aa7-cd77-407a-bb75-ef7ca5534af0',
  suggestApiKey: '',
  lang: 'ru_RU',
  coordorder: 'latlong',
  enterprise: false,
  version: '2.1'
};

app.use(piniaStore);
app.use(YmapPlugin, ymapConfig)
app.mount('#app')
