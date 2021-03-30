import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#01679f',
                secondary: '#282634',
                accent: '#4ac25b',
            },
        },
    },
});