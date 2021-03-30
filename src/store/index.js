import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    boards: [{
      title: "Pending",
      color: "red",
      tasks: []
    }, {
      title: "Processing",
      color: "blue",
      tasks: []
    }, {
      title: "Done",
      color: "green",
      tasks: []
    }]
  },
  mutations: {
    initBoards(state, boardsData) {
      state.boards = boardsData;
    },
    updateTask(state, payload) {
      const theBoard = state.boards.find((board) => board.title === payload.board);
      theBoard.tasks[payload.index] = payload.task;
    }
  },
  actions: {
    async saveBoards({ dispatch }) {
      const boardsData = JSON.stringify(
        await dispatch('createLocalStorageObjectFromBoards')
      );
      localStorage.setItem("boards", boardsData);
    },
    async createLocalStorageObjectFromBoards({ state, dispatch }) {
      const result = [];

      for (let board of state.boards) {
        const boardCopy = { ...board };

        for (let task of boardCopy.tasks) {
          if (
            task.attachment.find((a) => a instanceof File || a instanceof Blob)
          ) {
            task.attachment = await dispatch('filesToBase64', task.attachment);
          }
        }

        result.push(boardCopy);
      }
      return result;
    },
    fileToBase64(_, file) {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onerror = () => {
          reader.abort();
          reject(new Error("Error parsing file"));
        };
        reader.onload = function () {
          let bytes = Array.from(new Uint8Array(this.result));
          let base64StringFile = btoa(
            bytes.map((item) => String.fromCharCode(item)).join("")
          );
          resolve({
            base64StringFile: base64StringFile,
            fileName: file.name,
            fileType: file.type,
          });
        };

        if (file instanceof File || file instanceof Blob) {
          reader.readAsArrayBuffer(file);
        } else {
          resolve(file);
        }
      });
    },
    filesToBase64({ dispatch }, files) {
      return Promise.all(files.map((file) => dispatch('fileToBase64', file)));
    },
    findAndReplaceTask({ state, commit }, updatedTask) {
      const updatePayload = {
        board: null,
        index: null,
        task: updatedTask
      }

      boardsLoop: for (let board of state.boards) {
        for (let [index, task] of board.tasks.entries()) {
          if (task.id === updatedTask.id) {
            updatePayload.board = board.title;
            updatePayload.index = index;
            updatePayload.task = updatedTask;
            break boardsLoop;
          }
        }
      }

      commit('updateTask', updatePayload);
    }
  },
  modules: {
  }
})
