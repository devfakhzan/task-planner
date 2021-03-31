<template>
  <div>
    <v-snackbar
      v-model="snackBar.show"
      top
      right
      :color="snackBar.color"
      :timeout="2000"
    >
      {{ snackBar.text }}
    </v-snackbar>

    <v-dialog v-model="showMovingTaskDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline"
            >Move Task "{{ movingTask.selectedTask.title }}"</span
          >
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="movingTask.toBoard"
                  :items="$root.boardList"
                  label="To board"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  item-text="location"
                  item-value="locationDetails"
                  :disabled="!movingTask.toBoard"
                  :items="possibleMoveLocations"
                  v-model="movingTask.location"
                  label="Location"
                  no-data-text="Top of the board"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  v-model="movingTask.makeCopy"
                  label="Make copy?"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="showMovingTaskDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :disabled="!movingTask.toBoard"
            @click="
              moveTask(
                movingTask.selectedTask.id,
                movingTask.fromBoard,
                movingTask.toBoard,
                movingTask.location.index,
                movingTask.location.position,
                movingTask.makeCopy
              )
            "
          >
            {{ movingTask.makeCopy ? "Copy & Move Task" : "Move Task" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showSearchTaskDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Search & Filter Tasks</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="10">
                <v-text-field
                  prepend-icon="mdi-note-plus-outline"
                  label="Search keyword"
                  v-model="searchAndFilters.searchKeyword"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="2">
                <v-btn
                  color="primary"
                  @click="searchAndFilters.searchKeyword = ''"
                  class="mr-3 my-2"
                  :outlined="searchAndFilters.searchKeyword ? false : true"
                  block
                >
                  Clear
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="searchAndFilters.filters.time.startAmPm"
                  label="Estimated start time"
                  prepend-icon="mdi-clock-time-four-outline"
                  readonly
                  @click="showStartTimePickerDialog = true"
                ></v-text-field>
                <v-btn
                  color="primary"
                  @click="clearFilterTimeStart"
                  class="mr-2 my-2"
                  :outlined="searchAndFilters.filters.time.start ? false : true"
                  block
                >
                  Clear Start Time
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="searchAndFilters.filters.time.endAmPm"
                  label="Estimated end time"
                  prepend-icon="mdi-clock-time-four-outline"
                  readonly
                  :disabled="!searchAndFilters.filters.time.start"
                  @click="checkAndShowEndTimePickerDialog"
                ></v-text-field>
                <v-btn
                  color="primary"
                  @click="clearFilterTimeEnd"
                  class="mr-2 my-2"
                  :outlined="searchAndFilters.filters.time.end ? false : true"
                  block
                >
                  Clear End Time
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="showSearchTaskDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConfirmDeleteTaskDialog" max-width="290px">
      <v-card>
        <v-card-title class="headline">
          Confirm to delete this task?
        </v-card-title>

        <v-card-text>
          This action cannot be undone.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="primary darken-1"
            text
            @click="showConfirmDeleteTaskDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn color="primary darken-1" text @click="deleteTask">
            Confirm Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showTaskAttachmentDialog" max-width="290px">
      <v-card>
        <v-card-title class="break-word"
          >Attachments for Task "{{
            selectedTaskForAttachment.taskTitle
          }}"</v-card-title
        >
        <v-divider></v-divider>
        <v-card-text style="height: 300px;">
          <v-radio-group
            v-model="selectedTaskForAttachment.selectedAttachment"
            column
            class="attachment-list"
          >
            <v-radio
              v-for="(attachment,
              attachmentIndex) in selectedTaskForAttachment.attachments"
              :key="`attachment_${attachmentIndex}`"
              :label="attachment.fileName"
              :value="attachment"
            >
            </v-radio>
          </v-radio-group>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn
            color="blue darken-1"
            text
            @click="downloadFile(selectedTaskForAttachment.selectedAttachment)"
          >
            Download
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="showTaskAttachmentDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      ref="showTimePickerDialog"
      v-model="showTimePickerDialog"
      :return-value.sync="addingTask.time"
      width="460px"
    >
      <v-time-picker
        color="primary"
        v-if="showTimePickerDialog"
        v-model="addingTask.time"
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
          @click="$refs.showTimePickerDialog.save(addingTask.time)"
        >
          OK
        </v-btn>
      </v-time-picker>
    </v-dialog>

    <v-dialog
      ref="showStartTimePickerDialog"
      v-model="showStartTimePickerDialog"
      :return-value.sync="searchAndFilters.filters.time.start"
      width="460px"
    >
      <v-time-picker
        color="primary"
        v-if="showStartTimePickerDialog"
        v-model="searchAndFilters.filters.time.start"
        full-width
        format="ampm"
        scrollable
        :max="searchAndFilters.filters.time.end"
      >
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="showStartTimePickerDialog = false">
          Cancel
        </v-btn>
        <v-btn
          text
          color="primary"
          @click="
            $refs.showStartTimePickerDialog.save(
              searchAndFilters.filters.time.start
            )
          "
        >
          OK
        </v-btn>
      </v-time-picker>
    </v-dialog>

    <v-dialog
      ref="showEndTimePickerDialog"
      v-model="showEndTimePickerDialog"
      :return-value.sync="searchAndFilters.filters.time.end"
      width="460px"
    >
      <v-time-picker
        color="primary"
        v-if="showEndTimePickerDialog"
        v-model="searchAndFilters.filters.time.end"
        full-width
        format="ampm"
        scrollable
        :min="searchAndFilters.filters.time.start"
      >
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="showEndTimePickerDialog = false">
          Cancel
        </v-btn>
        <v-btn
          text
          color="primary"
          @click="
            $refs.showEndTimePickerDialog.save(
              searchAndFilters.filters.time.end
            )
          "
        >
          OK
        </v-btn>
      </v-time-picker>
    </v-dialog>

    <v-dialog v-model="showAddTaskDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Add New Task</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="addNewTaskForm" v-model="addNewTaskValid">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    prepend-icon="mdi-note-plus-outline"
                    label="Task title*"
                    required
                    v-model="addingTask.title"
                    :rules="$root.notEmptyRule"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    prepend-icon="mdi-note-text-outline"
                    name="input-7-1"
                    label="Task Description"
                    v-model="addingTask.description"
                    rows="3"
                  ></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-file-input
                    chips
                    multiple
                    v-model="addingTask.attachment"
                    label="Attachment"
                  ></v-file-input>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="addingTask.timeAmPm"
                    label="Estimated time*"
                    :rules="$root.notEmptyRule"
                    prepend-icon="mdi-clock-time-four-outline"
                    readonly
                    @click="showTimePickerDialog = true"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    prepend-icon="mdi-clipboard-outline"
                    :items="$root.boardList"
                    v-model="addingTask.board"
                    :rules="$root.notEmptyRule"
                    label="Board*"
                    required
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showAddTaskDialog = false">
            Close
          </v-btn>
          <v-btn color="blue darken-1" text @click="addTask">
            <v-icon left dark>
              mdi-plus-circle-outline
            </v-icon>
            Add Task
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-main class="main-container">
      <div class="grey lighten-5 py-8 px-8 full-height">
        <v-row>
          <v-col
            cols="12"
            v-if="allFilteredTasks.length && !anySearchOrFilterActive"
          >
            <v-card outlined tile class="pa-5 rounded">
              <h3 class="mb-3 d-flex justify-center">
                Progress
              </h3>
              <div class="my-2">
                <v-progress-linear
                  rounded
                  color="green lighten-2"
                  :value="doneTasksPercentage"
                  height="25"
                >
                  <small>
                    <strong>
                      {{ doneTasksPercentage }}% {{ doneTasksDetails }}
                    </strong>
                  </small>
                </v-progress-linear>
              </div>
              <div
                v-if="doneTasksPercentage == 100"
                class="mt-5 d-flex justify-center text-center"
              >
                🎉 Congratulations on completing all
                {{ allFilteredTasks.length }} tasks! 🎉
              </div>
            </v-card>
          </v-col>

          <v-col class="d-flex justify-end flex-wrap" cols="12">
            <div v-if="allTasks.length">
              <v-btn
                color="primary"
                @click="showSearchTaskDialog = true"
                class="mx-1 my-2"
                :outlined="anySearchOrFilterActive ? false : true"
              >
                <v-icon left>
                  mdi-feature-search-outline
                </v-icon>
                Search & Filter
                {{
                  anySearchOrFilterActive ? `(${allFilteredTasks.length})` : ""
                }}
              </v-btn>
            </div>
            <v-btn
              color="primary"
              @click="showAddTaskDialog = true"
              class="mx-1 my-2"
              outlined
            >
              <v-icon left>
                mdi-plus
              </v-icon>
              Add Task
            </v-btn>
          </v-col>

          <v-col
            cols="12"
            md="4"
            v-for="(board, boardIndex) in filteredBoards"
            :key="`board_${boardIndex}`"
          >
            <v-card class="pa-2 rounded zone" outlined tile>
              <v-card-title
                @dragover.prevent
                @dragenter.prevent="entered"
                @dragleave.prevent="left"
                @drop="
                  onDrop($event, {
                    board: board.title,
                    location: 'above',
                    index: 0,
                  })
                "
                class="unselectable d-flex flex-column"
              >
                <div class="break-word">
                  {{ board.title }} {{ taskCounter(board.title) }}
                </div>
              </v-card-title>
              <transition-group name="slide-fade-up" mode="out-in">
                <div
                  v-for="(task, taskIndex) in board.tasks"
                  :key="`task_${taskIndex}`"
                >
                  <v-card
                    class="mx-3 task-card"
                    :key="task.id"
                    draggable
                    @drag="dragging"
                    @dragstart="startDrag($event, task.id, board.title)"
                    @dragend="hideDropZones"
                    :elevation="0"
                    outlined
                  >
                    <v-app-bar
                      :class="[board.color]"
                      class="lighten-5"
                      dense
                      elevation="0"
                    >
                      <v-toolbar-title>{{ task.title }}</v-toolbar-title>
                      <v-spacer />
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            icon
                            v-bind="attrs"
                            v-on="on"
                            @click="setMoveTask(task, board.title)"
                          >
                            <v-icon class="mx-1">
                              mdi-clipboard-arrow-right
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>Move / Copy Task</span>
                      </v-tooltip>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            icon
                            v-bind="attrs"
                            v-on="on"
                            @click="setEditTask(task.id)"
                          >
                            <v-icon class="mx-1">
                              mdi-pencil
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>Edit Task</span>
                      </v-tooltip>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            icon
                            v-bind="attrs"
                            v-on="on"
                            @click="setDeleteTask(board.title, task.id)"
                          >
                            <v-icon class="mx-1">
                              mdi-delete-forever
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>Delete Task</span>
                      </v-tooltip>
                    </v-app-bar>
                    <v-card-text>
                      <div>Task:</div>

                      <v-toolbar-title>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <small
                              class="special-ellipsis"
                              v-bind="attrs"
                              v-on="on"
                            >
                              {{ task.title }}
                            </small>
                          </template>
                          <div class="title-description-tooltip">
                            {{ task.title }}
                          </div>
                        </v-tooltip>
                      </v-toolbar-title>

                      <div v-if="task.description">
                        <div class="mt-2">Description:</div>
                        <v-toolbar-title>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <small
                                class="special-ellipsis"
                                v-bind="attrs"
                                v-on="on"
                              >
                                {{ task.description }}
                              </small>
                            </template>
                            <div class="title-description-tooltip">
                              {{ task.description }}
                            </div>
                          </v-tooltip>
                        </v-toolbar-title>
                      </div>
                      <div class="mt-2">Estimated Time:</div>
                      <v-toolbar-title
                        ><small> {{ $root.amPmTime(task.time) }}</small>
                      </v-toolbar-title>

                      <div v-if="task.attachment.length">
                        <div class="mt-2">Attachments:</div>
                        <v-toolbar-title
                          ><small> {{ task.attachment.length }}</small>
                        </v-toolbar-title>
                      </div>
                    </v-card-text>
                    <v-card-actions v-if="task.attachment.length">
                      <v-btn
                        text
                        color="primary accent-4"
                        @click="setViewTaskAttachment(task)"
                      >
                        View Attachments
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                  <div
                    :key="`board_${boardIndex}_task_${taskIndex}`"
                    class="task-drop-zone"
                    @dragover.prevent
                    @dragenter.prevent="entered"
                    @dragleave.prevent="left"
                    @drop="
                      onDrop($event, {
                        board: board.title,
                        location: 'below',
                        index: taskIndex,
                      })
                    "
                  ></div>
                </div>
              </transition-group>
              <div v-if="!board.tasks.length">
                <div class="px-3 my-5 unselectable no-task">
                  No task here
                </div>
                <div
                  @dragover.prevent
                  @dragenter.prevent="entered"
                  @dragleave.prevent="left"
                  @drop="
                    onDrop($event, {
                      board: board.title,
                      location: 'above',
                      index: 0,
                    })
                  "
                  class="empty-board-drop-zone rounded"
                ></div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-main>
  </div>
</template>

<script>
export default {
  name: "Main",

  created() {
    document.title = this.$root.appName;
    window.scrollTo(0, 0);
    if (this.$route.params?.editSuccess) {
      this.showSnackBar("Task edited successfully");
    }
  },

  methods: {
    showSnackBar(message) {
      this.snackBar.text = message;
      this.snackBar.show = true;
    },
    async downloadFile(attachment) {
      const file = this.$root.getFileObject(attachment);
      const link = document.createElement("a");
      link.download = file.name;
      link.href = URL.createObjectURL(file);
      link.click();
    },
    setViewTaskAttachment(task) {
      this.selectedTaskForAttachment.taskTitle = task.title;
      this.selectedTaskForAttachment.attachments = task.attachment;
      this.showTaskAttachmentDialog = true;
    },
    setAmPmAddingTaskTime() {
      if (this.addingTask.time) {
        this.addingTask.timeAmPm = this.$root.amPmTime(this.addingTask.time);
      }
    },
    clearFilterTimeEnd() {
      this.searchAndFilters.filters.time.end = "";
      this.searchAndFilters.filters.time.endAmPm = "";
    },
    clearFilterTimeStart() {
      this.clearFilterTimeEnd();
      this.searchAndFilters.filters.time.start = "";
      this.searchAndFilters.filters.time.startAmPm = "";
    },
    setAmPmFilterTime() {
      const timeFilter = this.searchAndFilters.filters.time;
      if (timeFilter.start) {
        timeFilter.startAmPm = this.$root.amPmTime(timeFilter.start);
      }

      if (timeFilter.end) {
        timeFilter.endAmPm = this.$root.amPmTime(timeFilter.end);
      }
    },
    checkAndShowEndTimePickerDialog() {
      if (this.searchAndFilters.filters.time.start) {
        this.showEndTimePickerDialog = true;
      }
    },
    searchBoards() {
      const keyword = this.searchAndFilters.searchKeyword.toLowerCase();
      const result = [];
      this.$store.state.boards.forEach((board) => {
        const boardCopy = { ...board };
        boardCopy.tasks = boardCopy.tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(keyword) ||
            task.description.toLowerCase().includes(keyword)
        );
        result.push(boardCopy);
      });
      return result;
    },
    filterTimeBoards(boards) {
      const start = this.searchAndFilters.filters.time.start;
      const end = this.searchAndFilters.filters.time.end;
      const result = [];
      boards.forEach((board) => {
        const boardCopy = { ...board };
        boardCopy.tasks = boardCopy.tasks.filter(
          (task) => task.time >= start && task.time <= end
        );
        result.push(boardCopy);
      });
      return result;
    },
    setDeleteTask(board, taskId) {
      this.toBeDeleted = {
        board,
        taskId,
      };
      this.showConfirmDeleteTaskDialog = true;
    },
    async deleteTask() {
      const targetTasks = this.$store.state.boards.find(
        (board) => board.title == this.toBeDeleted.board
      ).tasks;
      const taskIndex = targetTasks.findIndex(
        (task) => task.id == this.toBeDeleted.taskId
      );
      targetTasks.splice(taskIndex, 1);

      this.showConfirmDeleteTaskDialog = false;
      this.showSnackBar("Task deleted successfully");

      this.toBeDeleted = null;

      await this.$store.dispatch("saveBoards");
    },
    getRandomId() {
      const randomLetter = String.fromCharCode(
        65 + Math.floor(Math.random() * 26)
      );
      return randomLetter + Date.now();
    },
    setEditTask(taskId) {
      this.$router.push(`/edit/${taskId}`);
    },
    async addTask() {
      this.$refs.addNewTaskForm.validate();
      if (!this.addNewTaskValid) {
        return;
      }

      const targetTasks = this.$store.state.boards.find(
        (board) => board.title == this.addingTask.board
      ).tasks;
      targetTasks.push({
        id: this.getRandomId(),
        ...this.addingTask,
      });

      await this.$store.dispatch("saveBoards");

      this.showAddTaskDialog = false;
      this.$refs.addNewTaskForm.resetValidation();

      this.showSnackBar("Task added successfully");

      this.addingTask.title = "";
      this.addingTask.description = "";
      this.addingTask.board = "";
      this.addingTask.time = "";
      this.addingTask.timeAmPm = "";
      this.addingTask.attachment = [];
    },
    taskCounter(board) {
      const boardTasks = this.filteredBoards.find((b) => b.title == board)
        .tasks;
      const tasksCount = boardTasks.length;
      const allFilteredTasksCount = this.allFilteredTasks.length;
      const percentage = Math.floor((tasksCount / allFilteredTasksCount) * 100);
      return !isNaN(percentage)
        ? `(${tasksCount}/${allFilteredTasksCount}) (${percentage}%)`
        : "";
    },
    showDropZones() {
      document.querySelectorAll(".task-drop-zone").forEach((el) => {
        el.style.opacity = 1;
        el.style.padding = "15px";
      });
      document.querySelectorAll(".empty-board-drop-zone").forEach((el) => {
        el.style.opacity = 1;
      });
    },
    hideDropZones() {
      document.querySelectorAll(".task-drop-zone").forEach((el) => {
        el.style.opacity = 0;
        el.style.padding = 0;
      });
      document.querySelectorAll(".empty-board-drop-zone").forEach((el) => {
        el.style.opacity = 0;
      });
    },
    scrollWhileDragging(e) {
      const draggingAtHeightPercentage = Math.floor(
        (e.screenY / window.outerHeight) * 100
      );
      if (draggingAtHeightPercentage >= 90) {
        window.scrollBy({
          top: 100,
          left: 0,
          behavior: "smooth",
        });
        window.scrollY = window.scrollY + 20;
      } else if (draggingAtHeightPercentage <= 20) {
        window.scrollBy({
          top: -100,
          left: 0,
          behavior: "smooth",
        });
      }
    },
    dragging(e) {
      this.showDropZones();
      this.scrollWhileDragging(e);
    },
    entered(e) {
      e.target.style.color = "#01989f";
    },
    left(e) {
      e.target.style.color = "";
    },
    startDrag(e, taskId, board) {
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("taskId", taskId);
      e.dataTransfer.setData("fromBoard", board);
    },
    arrayMove(arr, fromIndex, toIndex, targetArr = arr, makeCopy = false) {
      let task = arr[fromIndex];

      if (!makeCopy) {
        arr.splice(fromIndex, 1);
        targetArr.splice(toIndex, 0, task);
      } else {
        const clonedTask = JSON.parse(JSON.stringify(task));
        clonedTask.id = this.getRandomId();
        targetArr.splice(toIndex, 0, clonedTask);
      }
    },
    setMoveTask(task, fromBoard) {
      this.movingTask.selectedTask = task;
      this.movingTask.fromBoard = fromBoard;
      this.movingTask.makeCopy = false;
      this.showMovingTaskDialog = true;
    },
    clearMovingTask() {
      this.movingTask = {
        selectedTask: {},
        fromBoard: "",
        toBoard: "",
        location: {},
        makeCopy: false,
      };
    },
    async moveTask(taskId, fromBoard, toBoard, toIndex, location, makeCopy) {
      const fromBoardTasks = this.$store.state.boards.find(
        (board) => board.title == fromBoard
      ).tasks;
      const fromBoardTaskIndex = fromBoardTasks.findIndex(
        (task) => task.id == taskId
      );
      const toBoardTasks = this.$store.state.boards.find(
        (board) => board.title == toBoard
      ).tasks;

      if (location == "above") {
        this.arrayMove(
          fromBoardTasks,
          fromBoardTaskIndex,
          toIndex,
          toBoardTasks,
          makeCopy
        );
      } else {
        this.arrayMove(
          fromBoardTasks,
          fromBoardTaskIndex,
          toIndex + 1,
          toBoardTasks,
          makeCopy
        );
      }

      this.showMovingTaskDialog = false;
      this.clearMovingTask();
      await this.$store.dispatch("saveBoards");
    },
    async onDrop(e, details) {
      this.moveTask(
        e.dataTransfer.getData("taskId"),
        e.dataTransfer.getData("fromBoard"),
        details.board,
        details.index,
        details.location,
        false
      );

      this.hideDropZones();
      e.target.style.color = "";

      await this.$store.dispatch("saveBoards");
    },
  },

  components: {},

  data: () => ({
    searchAndFilters: {
      searchKeyword: "",
      filters: {
        time: {
          start: "",
          end: "",
        },
      },
    },
    selectedTaskForAttachment: {
      taskTitle: "",
      attachments: [],
      selectedAttachment: {},
    },
    showAddTaskDialog: false,
    showTimePickerDialog: false,
    showMovingTaskDialog: false,
    showConfirmDeleteTaskDialog: false,
    showSearchTaskDialog: false,
    showStartTimePickerDialog: false,
    showEndTimePickerDialog: false,
    showTaskAttachmentDialog: false,

    toBeDeleted: {
      board: "",
      taskId: "",
    },
    snackBar: {
      show: false,
      text: "",
      color: "green",
    },
    movingTask: {
      selectedTask: {},
      fromBoard: "",
      toBoard: "",
      location: {},
      makeCopy: false,
    },
    reveal: false,
    boards: [],
    addingTask: {
      title: "",
      description: "",
      board: "",
      time: "",
      timeAmPm: "",
      attachment: [],
    },
    addNewTaskValid: false,
  }),

  watch: {
    "searchAndFilters.filters.time": {
      handler(val) {
        if (val) {
          this.setAmPmFilterTime();
        }
      },
      deep: true,
    },
    "addingTask.time"(val) {
      if (val) {
        this.setAmPmAddingTaskTime();
      }
    },
  },

  computed: {
    anySearchOrFilterActive() {
      return (
        this.searchAndFilters.searchKeyword ||
        (this.searchAndFilters.filters.time.start &&
          this.searchAndFilters.filters.time.end)
      );
    },
    filteredBoards() {
      let fullBoardsData = this.$store.state.boards;

      if (this.searchAndFilters.searchKeyword) {
        fullBoardsData = this.searchBoards();
      }

      if (
        this.searchAndFilters.filters.time.start &&
        this.searchAndFilters.filters.time.end
      ) {
        fullBoardsData = this.filterTimeBoards(fullBoardsData);
      }

      return fullBoardsData;
    },
    possibleMoveLocations() {
      if (!this.movingTask.toBoard) {
        return [];
      }

      const options = [];
      const tasks = this.$store.state.boards.find(
        (board) => board.title == this.movingTask.toBoard
      ).tasks;

      tasks.forEach((task, index) => {
        if (task.id !== this.movingTask.selectedTask.id) {
          if (index == 0) {
            options.push({
              location: `Above ${task.title}`,
              locationDetails: { position: "above", index },
            });
          }

          options.push({
            location: `Below ${task.title}`,
            locationDetails: { position: "below", index },
          });
        }
      });

      return options;
    },
    doneTasksDetails() {
      return `(Done ${
        this.filteredBoards.find((board) => board.title == "Done").tasks.length
      } out of ${this.allFilteredTasks.length})`;
    },
    doneTasksPercentage() {
      return Math.floor(
        (this.filteredBoards.find((board) => board.title == "Done").tasks
          .length /
          this.allFilteredTasks.length) *
          100
      );
    },
    allFilteredTasks() {
      const tasks = [];
      this.filteredBoards.forEach((board) => {
        board.tasks.forEach((task) => {
          tasks.push(task);
        });
      });

      return tasks;
    },
    allTasks() {
      const tasks = [];
      this.$store.state.boards.forEach((board) => {
        board.tasks.forEach((task) => {
          tasks.push(task);
        });
      });

      return tasks;
    },
  },
};
</script>

<style lang="scss">
@import "@/styles/styles.scss";

.main-container {
  min-height: 100vh;
}

.full-height {
  height: 100%;
}

.v-card--reveal {
  bottom: 0;
  opacity: 1 !important;
  position: absolute !important;
  width: 100%;
  border-bottom: none;
}

.task-card {
  cursor: pointer;

  &.over {
    border: 3px dotted #01989f;
  }
}

[draggable],
.unselectable {
  user-select: none;
}

.task-drop-zone {
  user-select: none;
  opacity: 0;
  border: 1px dashed $primary;
  margin-left: 12px;
  margin-right: 12px;
  margin-top: 12px;
  margin-bottom: 12px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  z-index: -1;
  transition: all .3s ease;
}

.empty-board-drop-zone {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  margin-left: -8px;
  opacity: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  border: 1px dashed $primary;
  transition: all .3s ease;
}

.logo {
  cursor: pointer;
}

.title-description-tooltip {
  max-width: 200px;
}

.no-task {
  text-align: center;
}

.attachment-list {
  max-height: 100%;
  overflow-y: auto;
}

.break-word {
  word-break: break-word !important;
}
</style>
