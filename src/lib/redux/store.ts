
import { configureStore } from "@reduxjs/toolkit";
import dialogDrawerReducer from "@/lib/redux/features/private/dialog-drawer-slice";
import replyReducer from "@/lib/redux/features/private/reply-slice";

// This file sets up the Redux store for the application.
// A factory function to create a new store instance for each request
export const ytubeReduxStore = () => {
    return configureStore({
        reducer: {
            dialog_drawer: dialogDrawerReducer,
            reply: replyReducer,
        },
        // Optional: DevTools are automatically configured in development
        devTools: process.env.NODE_ENV !== "production",
    });
};

//  This is the main Redux store configuration for the application.
// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppStore = ReturnType<typeof ytubeReduxStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;
