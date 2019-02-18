import Vue from 'vue'
import Vuetify from 'vuetify'

import Nedb from 'nedb'
const db = new Nedb({ filename: 'images', autoload: true })

Vue.prototype.$db = db

Vue.use(Vuetify)
