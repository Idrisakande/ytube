import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    openThumbnailUploadModal: false as boolean,
    openThumbnailGenerateModal: false as boolean,
};

const dialog_drawer_slice = createSlice({
    name: "dialog_drawer_slice",
    initialState,
    reducers: {
        UpdateOpenThumbnailUploadModal: (state, action: PayloadAction<boolean>) => {
            state.openThumbnailUploadModal = action.payload;
        },
        UpdateOpenThumbnailGenerateModal: (state, action: PayloadAction<boolean>) => {
            state.openThumbnailGenerateModal = action.payload;
        },
    },
});

export const {
    UpdateOpenThumbnailUploadModal, UpdateOpenThumbnailGenerateModal
} = dialog_drawer_slice.actions;
export default dialog_drawer_slice.reducer;