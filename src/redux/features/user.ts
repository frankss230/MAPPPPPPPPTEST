import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

interface User {
    permission : number | null;
    userName   : string | null;
    userId     : number | null;
    accessToken: string | null;
}
interface UserState {
    user: User;
}
const initialState: UserState = {
    user: {
        permission : null,
        userName   : null,
        userId     : null,
        accessToken: null,
    },
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setDataUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload
        },
        removeDataUser: () => {
            return initialState
        }
    }
});


export const { setDataUser, removeDataUser } = userSlice.actions;
export default userSlice.reducer;
