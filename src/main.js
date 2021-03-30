import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  data: () => ({
    notEmptyRule: [(v) => !!v || "This field is required"],
    boardList: ["Pending", "Processing", "Done"],
    appName: 'The Task Planner'
  }),
  methods: {
    isValidJson(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    },
    amPmTime(time) {
      return new Date(`1970-01-01T${time}:00Z`).toLocaleTimeString(
        {},
        { timeZone: "UTC", hour12: true, hour: "numeric", minute: "numeric" }
      );
    },
    getFileObject(attachment){
      let bstr = atob(attachment.base64StringFile),
        n = bstr.length,
        u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], attachment.fileName, {
        type: attachment.fileType,
      });
    }
  },
  render: h => h(App)
}).$mount('#app')
