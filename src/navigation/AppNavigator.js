import React from 'react';
import HistoryScreen from '../screens/HistoryScreen';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen     from '../screens/HomeScreen';
import ScannerScreen  from '../screens/ScannerScreen';
import GradeScreen    from '../screens/GradeScreen';
import StudentsScreen from '../screens/StudentsScreen';
import ReportsScreen  from '../screens/ReportsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Home"     component={HomeScreen}     />
      <Stack.Screen name="Scanner"  component={ScannerScreen}  />
      <Stack.Screen name="Grade"    component={GradeScreen}    />
      <Stack.Screen name="Students" component={StudentsScreen} />
      <Stack.Screen name="Reports"  component={ReportsScreen}  />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}
