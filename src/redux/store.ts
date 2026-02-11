import { configureStore } from "@reduxjs/toolkit";

import modalSlice from "./features/modal";
import userSlice from "./features/user";


export const store = configureStore({
    reducer: {
        modal: modalSlice,
        user : userSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
