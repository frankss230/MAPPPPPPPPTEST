import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";



const initialState = {
    alert: {
        show      : false,
        title     : 'AFE+',
        message   : '',
        redirectTo: ''
    },
    processing: false,
};

const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        openModalAlert: (state, action: PayloadAction<Alert>) => {
            state.alert = {
                ...state.alert,
                ...action.payload,
                show: true
            }
        },
        closeModalAlert: () => {
            return initialState
        },
        openProcess: (state) => {
            state.processing = true
        },
        closeProcess: (state) => {
            state.processing = false
        }
    },
    extraReducers: (builder) => {
        builder.addCase(incrementAsync.pending, (state) => {
            state.processing = true;
        });
        builder.addCase(incrementAsync.fulfilled, (state, action) => {
            console.log('action.payload', action.payload)
            state.processing = false;
            // state.alert = action.payload;
        });
        builder.addCase(incrementAsync.rejected, (state) => {
            state.processing = false;
        });
    }
});

export const incrementAsync = createAsyncThunk(
    'counter/fetchCount',
    async (amount: number) => {
        const response = await fetchCount(amount);
        console.log('response', response)
        return response;
    }
);

const fetchCount = async (amount: number) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${amount}`);
    return await response.json();
}

export const { openModalAlert, closeModalAlert, openProcess, closeProcess } = modalSlice.actions;
export default modalSlice.reducer;
