import { configureStore } from'@reduxjs/toolkit';
import authReducer from'./auth/authSlice';
import lawyersReducer from'./lawyers/lawyersSlice';
import subscriptionsReducer from'./subscriptions/subscriptionsSlice';
import plansReducer from'./plans/plansSlice';
import notificationsReducer from'./notifications/notificationsSlice';
import reportsReducer from'./reports/reportsSlice';
import settingsReducer from'./settings/settingsSlice';
import contactsReducer from'./contacts/contactSlice';
import aiModelConfigReducer from'./aiModelConfig/aiModelConfigSlice';
import aiUsageReducer from'./aiUsage/aiUsageSlice';
import reviewsReducer from'./reviews/reviewsSlice';
import analyticsReducer from'../features/analytics/analyticsSlice';

export const store = configureStore({
 reducer: {
 auth: authReducer,
 lawyers: lawyersReducer,
 subscriptions: subscriptionsReducer,
 plans: plansReducer,
 notifications: notificationsReducer,
 reports: reportsReducer,
 settings: settingsReducer,
 contacts: contactsReducer,
 aiModelConfig: aiModelConfigReducer,
 aiUsage: aiUsageReducer,
 reviews: reviewsReducer,
 analytics: analyticsReducer,
 },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
