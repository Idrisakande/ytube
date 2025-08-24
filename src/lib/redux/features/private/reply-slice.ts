import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    isReplyOpen: false as boolean,
    isRepliesOpen: false as boolean,
};

const reply_slice = createSlice({
    name: "reply_slice",
    initialState,
    reducers: {
        UpdateIsReplyOpen: (state, action: PayloadAction<boolean>) => {
            state.isReplyOpen = action.payload;
        },
        UpdateIsRepliesOpen: (state, action: PayloadAction<boolean>) => {
            state.isRepliesOpen = action.payload;
        },
    },
});

export const {
    UpdateIsReplyOpen, UpdateIsRepliesOpen
} = reply_slice.actions;
export default reply_slice.reducer;