import React, { Component } from "react";
import { StyleSheet } from 'react-native';
import { Layout, Text, Spinner, Menu, Popover } from "@ui-kitten/components";

export default class WorkoutList extends Component {

    constructor(props){
        super(props);
        this.state = {
            data: null,
            excercisesForWorkout: null,
            chosenWorkout: null,
            popoverVisibility: false
        }
        this.getData();
    }

    formatData = (data) => {
        let newData = [];
        for(let i in data){
            newData.push({ title: data[i].name, id: data[i].id });
        }
        return newData;
    }

    //Vrne vse razpolozljive treninge
    getData = () => {
        fetch('https://fitness-progress-tracker.herokuapp.com/workouts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(res => {
            if (res.status !== 200) {
                throw new Error('Failed!');
            }
            return res.json();
        }).then((response) => {
            this.setState({
                data: this.formatData(response)
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    //Vrne vse vaje za trening s podanim ID-jem
    getExecercisesForWorkout = (workoutId) => {
        fetch('https://fitness-progress-tracker.herokuapp.com/excercises/' + workoutId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.status !== 200) {
                throw new Error('Failed!');
            }
            return res.json();
        }).then((response) => {
            this.setState({
                excercisesForWorkout: response
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    closePopover = () => {
        this.setState({
            popoverVisibility: false,
            excercisesForWorkout: null,
            chosenWorkout: null
        });
    }

    onMenuItemSelect = (e) => {
        this.setState({
            popoverVisibility: true,
            chosenWorkout: this.state.data[e].title
        });
        this.getExecercisesForWorkout(this.state.data[e].id);
    }

    render() {

        const PopoverContent = () => (
            <Layout style={styles.popoverContent}>
                {this.state.excercisesForWorkout ? (
                    <Layout>
                        <Text category='h5' style={{ textAlign: 'center' }}>{this.state.chosenWorkout}</Text>
                        <Text category='h6'>Excercises:</Text>
                        {this.state.excercisesForWorkout.map((d, i) => {
                                return(
                                    <Text key={i}>{d.name}</Text>
                                );
                            }
                        )}
                    </Layout>
                ) : (
                    <Layout style={styles.spinner}>
                        <Spinner size='giant'/>
                    </Layout>
                )}
            </Layout>
        );

        return(
            <Layout>
                {this.state.data ? (
                    <Popover
                        onBackdropPress={this.closePopover}
                        visible={this.state.popoverVisibility}
                        content={PopoverContent()}
                        backdropStyle={styles.backDrop}>
                        <Menu
                            data={this.state.data}
                            onSelect={this.onMenuItemSelect}
                            />
                    </Popover>
                ) : (
                    <Layout style={styles.spinner}>
                        <Spinner size='giant'/>
                    </Layout>
                )}
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    spinner: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100 %'
    },
    backDrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    popoverContent: {
        padding: 30
    }
});