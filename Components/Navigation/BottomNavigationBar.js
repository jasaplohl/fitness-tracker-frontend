import React, {Component} from 'react';
import { StyleSheet  } from 'react-native';

import { Icon, BottomNavigation, BottomNavigationTab } from '@ui-kitten/components';

const HomeIcon = (style) => ( <Icon {...style} name='home-outline'/> );
const PlusIcon = (style) => ( <Icon {...style} name='plus-outline'/> );
const ListIcon = (style) => ( <Icon {...style} name='list-outline'/> );

export default class TabBar extends Component {

    setSelectedIndex = (index) => {
        const selectedTabRoute = this.props.navigation.state.routes[index];
        this.props.navigation.navigate(selectedTabRoute.routeName);
    }

    render(){
        let selectedIndex = this.props.navigation.state.index;

        return(
            <BottomNavigation
                style={styles.bottomNavigation}
                selectedIndex={selectedIndex}
                onSelect={this.setSelectedIndex}>
                <BottomNavigationTab icon={HomeIcon}/>
                <BottomNavigationTab icon={PlusIcon}/>
                <BottomNavigationTab icon={ListIcon}/>
            </BottomNavigation>
        );
    }
}

const styles = StyleSheet.create({
    bottomNavigation: {
      marginVertical: 8,
    },
});