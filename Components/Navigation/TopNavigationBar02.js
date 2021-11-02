import React, {Component} from 'react';

import { TopNavigation, TopNavigationAction, Icon } from '@ui-kitten/components';
import { Actions } from 'react-native-router-flux';

const BackIcon = (style) => ( <Icon {...style} name='arrow-back'/> );

export default class NavigationBar extends Component {

    onBackPressed = () => {
        Actions.pop();
    }

    render(){

        const backAction = () => (
            <TopNavigationAction icon={BackIcon} onPress={this.onBackPressed}/>
        )

        return(
            <TopNavigation 
                title={this.props.title}
                alignment='center'
                leftControl={backAction()}/>
        );
    }
}