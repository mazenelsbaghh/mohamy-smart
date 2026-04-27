import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

type TPropsData = {
 clientID: string;
}

const thunkGetClientDetails = createAsyncThunk('clients/thunkGetClientDetails', async ({ clientID }: TPropsData, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get(`/Client/${clientID}`);
 return res.data.data
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
});

export default thunkGetClientDetails;