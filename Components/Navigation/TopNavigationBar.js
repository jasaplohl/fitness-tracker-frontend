import React, {Component} from 'react';

import { TopNavigation, TopNavigationAction, Icon } from '@ui-kitten/components';

const MenuIcon = (style) => ( <Icon {...style} name='menu-outline'/> );

export default class NavigationBar extends Component {
    render(){
        return(
            <TopNavigation 
                alignment='center'
                title={this.props.title} />
        );
    }
}