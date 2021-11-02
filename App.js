import React, { Component } from 'react';
import { Router, Scene, Tabs } from 'react-native-router-flux';

import { mapping, light as lightTheme } from '@eva-design/eva';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';

import AddCompleted from './Components/Screens/AddCompleted';
import CalendarPage from './Components/Screens/Calendar';
import WorkoutList from './Components/Screens/WorkoutList';
import EditCompleted from './Components/Screens/EditCompleted';
import TopNavigationBar from './Components/Navigation/TopNavigationBar';
import TopNavigationBar02 from'./Components/Navigation/TopNavigationBar02';
import BottomNavigationBar from './Components/Navigation/BottomNavigationBar';

export default class App extends Component {
  render(){
    return (
      <React.Fragment>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider mapping={mapping} theme={lightTheme}>
          <Router>
            <Scene key="root">
              <Tabs tabBarComponent={BottomNavigationBar} hideNavBar={true}>
                <Scene key="home" title="Home" component={CalendarPage} navBar={TopNavigationBar}/>
                <Scene key="addCompleted" title="Add completed training" component={AddCompleted} navBar={TopNavigationBar}/>
                <Scene key="workoutList" title="All workouts" component={WorkoutList} navBar={TopNavigationBar}/>
              </Tabs>
              <Scene key="editCompleted" title="Edit" component={EditCompleted} navBar={TopNavigationBar02}/>
            </Scene>
          </Router>
        </ApplicationProvider>
      </React.Fragment>
    );
  }
};