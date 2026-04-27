import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";


type TTask = {
 task: {
 title: string;
 Date: string;
 Time: string;
 Notes: string;
 }
}

const thunkAddNewTask = createAsyncThunk('thunkAddNewTask/tasks', async ({ task }: TTask, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.post(`/LawyerTask/create`, null, {
 params: {
 Title: task.title,
 Date: task.Date,
 Time: task.Time,
 Notes: task.Notes,
 }
 })
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error))
 }
})

export default thunkAddNewTask;