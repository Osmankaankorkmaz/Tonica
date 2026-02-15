import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import aiReducer from "./aiSlice";
import taskReducer from "./taskSlice";
import focusReducer from "./focusSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ai: aiReducer,
    tasks:taskReducer,
    focus:focusReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
