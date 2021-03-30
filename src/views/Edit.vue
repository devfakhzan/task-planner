<template>
  <div>
    <v-dialog
      ref="showTimePickerDialog"
      v-model="showTimePickerDialog"
      :return-value.sync="editingTask.time"
      width="460px"
    >
      <v-time-picker
        color="primary"
        v-if="showTimePickerDialog"
        v-model="editingTask.time"
        full-width
        format="ampm"
        scrollable
      >
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="showTimePickerDialog = false">
          Cancel
        </v-btn>
        <v-btn
          text
          color="primary"
          @click="$refs.showTimePickerDialog.save(editingTask.time)"
        >
          OK
        </v-btn>
      </v-time-picker>
    </v-dialog>

    <v-main class="main-container">
      <div class="pa-5">
        <div class="d-flex justify-end">
          <v-btn
            color="primary"
            @click="$router.push('/')"
            class="my-2"
            outlined
          >
            <v-icon left>
              mdi-arrow-left
            </v-icon>
            Back
          </v-btn>
        </div>

        <div v-if="invalidTask" class="text-center my-5">
          Invalid Task. Please try again.
        </div>

        <div v-else>
          <v-card :elevation="0">
            <v-card-text>
              <v-form ref="editTaskForm" v-model="editTaskValid">
                <v-container>
                  <span class="headline d-block mb-7"
                    >Edit Task "{{ editingTaskTitle }}"</span
                  >
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        prepend-icon="mdi-note-plus-outline"
                        label="Task title*"
                        required
                        v-model="editingTask.title"
                        :rules="$root.notEmptyRule"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        prepend-icon="mdi-note-text-outline"
                        name="input-7-1"
                        label="Task Description"
                        v-model="editingTask.description"
                        rows="3"
                      ></v-textarea>
                    </v-col>
                    <v-col cols="12">
                      <v-file-input
                        chips
                        multiple
                        v-model="editingTask.attachment"
                        label="Attachment"
                      ></v-file-input>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="editingTask.timeAmPm"
                        label="Estimated time*"
                        :rules="$root.notEmptyRule"
                        prepend-icon="mdi-clock-time-four-outline"
                        readonly
                        @click="showTimePickerDialog = true"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <small>*indicates required field</small>
                </v-container>
              </v-form>
            </v-card-text>
                    <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="editTask">
            <v-icon left dark>
              mdi-check-circle-outline
            </v-icon>
            Save Edit
          </v-btn>
        </v-card-actions>
          </v-card>
        </div>
      </div>
    </v-main>
  </div>
</template>

<script>
export default {
  name: "Edit",

  data: () => ({
    taskId: "",
    invalidTask: true,
    editingTaskTitle: '',
    editingTask: {
      title: "",
      description: "",
      board: "",
      time: "",
      timeAmPm: "",
      attachment: [],
    },
    editTaskValid: false,
    showTimePickerDialog: false
  }),

  methods: {
    async editTask() {
      this.$refs.editTaskForm.validate();
      if (!this.editTaskValid) {
        return;
      }
      const attachmentsAsString = await this.$store.dispatch('filesToBase64', this.editingTask.attachment);
      
      const updatedTask = JSON.parse(JSON.stringify(this.editingTask));
      updatedTask.attachment = attachmentsAsString;

      await this.$store.dispatch('findAndReplaceTask', updatedTask);
      await this.$store.dispatch('saveBoards');

      this.$router.replace({name:'The Task Planner', params:{editSuccess: true}});
    },
    setAmPmEditingTaskTime() {
      if (this.editingTask.time) {
        this.editingTask.timeAmPm = this.$root.amPmTime(this.editingTask.time);
      }
    },
  },

  created() {
    window.scrollTo(0, 0);
    this.taskId = this.$route.params?.taskId;
    if (!this.taskId) {
      return;
    }

    let editingTask = null;

    boardsLoop: for (let board of this.$store.state.boards) {
      for (let task of board.tasks) {
        if (task.id === this.taskId) {
          editingTask = JSON.parse(JSON.stringify(task));
          this.editingTaskTitle = editingTask.title;
          document.title = `${this.$root.appName} - Editing Task ${this.editingTaskTitle}`;
          editingTask.attachment = editingTask.attachment.map(a => this.$root.getFileObject(a));
          break boardsLoop;
        }
      }
    }

    if (!editingTask) {
      return;
    }
    
    this.editingTask = editingTask;
    this.invalidTask = false;
  },

  watch: {
    "editingTask.time"(val) {
      if (val) {
        this.setAmPmEditingTaskTime();
      }
    },
  }
};
</script>
