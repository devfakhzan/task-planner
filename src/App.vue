<template>
  <v-app>
    <v-app-bar app color="primary" dark :elevation="0" @click="goHome">
      <div class="d-flex align-center logo">
        <tp-logo />
        <strong class="ml-2">The Task Planner</strong>
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/devfakhzan/task-planner"
        target="_blank"
        text
      >
        <span class="mr-2">Source</span>
        <v-icon>mdi-github</v-icon>
      </v-btn>
    </v-app-bar>

    <transition name="slide-fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </v-app>
</template>

<script>
import TpLogo from "@/components/svg/TpLogo.vue";

export default {
  name: "App",

  components: {
    TpLogo,
  },

  created(){
    const boardsData = localStorage.getItem("boards");
    if (boardsData && this.$root.isValidJson(boardsData)) {
      this.$store.commit('initBoards', JSON.parse(boardsData));
    }
  },

  methods: {
    goHome() {
      if (this.$route.fullPath !== '/') {
        this.$router.push('/');
      }
    }
  }

};
</script>

<style>
.slide-fade-enter-active, .slide-fade-up-enter-active {
  transition: all .2s ease;
}

.slide-fade-leave-active, .slide-fade-up-leave-active {
  transition: all .2s ease;
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

.slide-fade-up-enter, .slide-fade-up-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

</style>