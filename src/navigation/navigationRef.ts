import { createNavigationContainerRef } from '@react-navigation/native';
import type { AppStackParamList } from './types';

// Lets code outside the component tree (the Sidebar, which sits alongside
// the Stack.Navigator rather than inside one of its screens) trigger
// navigation without drilling a navigation prop down to it.
export const navigationRef = createNavigationContainerRef<AppStackParamList>();
