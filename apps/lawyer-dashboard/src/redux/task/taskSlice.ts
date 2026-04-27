import { createSlice } from"@reduxjs/toolkit";
import type { TLoading } from"../../types/types";
import thunkGetAllTasks from"./thunk/thunkGetAllTasks";
import { isString } from"@mohamy/shared-utils";
import thunkAddNewTask from"./thunk/thunkAddNewTask";

type Task = {
 id: string;
 title: string;
 date: string; // ISO date string
 time: string | null;
 notes: string | null;
 lawyerId: string;
 isActive: boolean;
 creationDate: string;
}

type TInitialState = {
 tasks: Task[];
 loading: TLoading;
 error: string | null;
}

const initialState: TInitialState = {
 tasks: [],
 loading:'idle',
 error: null
}

const taskSlice = createSlice({
 name:'tasks',
 initialState,
 reducers: {},
 extraReducers(builder) {
 builder
 // Get All Tasks
 .addCase(thunkGetAllTasks.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetAllTasks.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.tasks = action.payload.data;
 })
 .addCase(thunkGetAllTasks.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // Add new Task
 .addCase(thunkAddNewTask.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
  .addCase(thunkAddNewTask.fulfilled, (state, action) => {
  state.loading ='succeeded';
  state.tasks.unshift(action.payload);
  })
 .addCase(thunkAddNewTask.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 },
});

export default taskSlice.reducer;