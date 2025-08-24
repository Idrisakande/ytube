import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CarouselApi } from "@/components/ui/carousel";

const initialState = {
    currentView: 0 as number,
    propertyCount: 0 as number,
    carouselApi: undefined as CarouselApi,
    morePropertyDetails: false as boolean
};

const property_slice = createSlice({
    name: "Property_slice",
    initialState,
    reducers: {
        UpdateCurrentView: (state, action: PayloadAction<number>) => {
            state.currentView = action.payload;
        },
        UpdatePropertyCount: (state, action: PayloadAction<number>) => {
            state.propertyCount = action.payload;
        },
        UpdateCarouselApi: (state, action: PayloadAction<CarouselApi>) => {
            state.carouselApi = action.payload;
        },
        UpdateMorePropertyDetails: (state, action: PayloadAction<boolean>) => {
            state.morePropertyDetails = action.payload;
        },
    },
});

export const {
    UpdateCurrentView, UpdatePropertyCount, UpdateCarouselApi, UpdateMorePropertyDetails
} = property_slice.actions;
export default property_slice.reducer;