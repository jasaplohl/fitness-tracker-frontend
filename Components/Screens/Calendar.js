import React, { Component } from "react";
import { SafeAreaView, StyleSheet, ScrollView, RefreshControl, Alert, ToastAndroid, Dimensions } from "react-native";

import { Calendar } from 'react-native-calendars';
import { Spinner, Popover, Layout, Text, Button, Icon, Card, CardHeader } from "@ui-kitten/components";
import { Actions } from "react-native-router-flux";

import LineChartComponent from '../OtherComponents/LineChartComponent';
import BarChartComponent from '../OtherComponents/BarChartComponent';

const EditIcon = (style) => ( <Icon {...style} name='edit-2-outline'/> );

export default class CalendarPage extends Component {

    constructor(props){
        super(props);

        let timeZone = new Date().getTimezoneOffset()/60; //izracunamo casovni zamik

        this.state = {
            calendarData: null,
            displayData: null,
            graphData: null,
            workoutCounter: null,
            popoverVisibility: false,
            selectedDate: null,
            refreshing: false,
            timeZoneOffset: timeZone,
        }

        this.getData();
    }

    getData = () => {
        fetch('https://fitness-progress-tracker.herokuapp.com/completed', {
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
            this.formatData(response);
        }).catch((error) => {
            console.log(error);
        });
    }

    //Pretvori datum v primeren format
    formatDateString = (date) => {
        let month = date.getMonth() + 1;
        let day = date.getDate();
        if(month < 10)
            month = "0" + month;
        if(day < 10)
            day = "0" + day;
        return date.getFullYear() + "-" + month + "-" + day;
    }

    //Pretvori podatke v format primeren za koledar
    formatData = (data) => {
        let newCalendarData = {};
        let newDisplayData = {};
        let newGraphData = [];
        let newWorkoutCounter = {};
        for(let i in data){
            let dateString = this.formatDateString( new Date(data[i].start_time));
            newDisplayData[dateString] = data[i];
            newCalendarData[dateString] = { selected: true, selectedColor: data[i].colour };
            if(data[i].weight != null) //Dodamo samo tiste, ki imajo shranjene podatke o tezah za posamezno vajo
                newGraphData.push({ date: data[i].start_time, excercises: data[i].weight });
            if(newWorkoutCounter[data[i].workout_name] == undefined){
                newWorkoutCounter[data[i].workout_name] = 1;
            }else{
                newWorkoutCounter[data[i].workout_name]++;
            }
        }

        this.setState({
            displayData: newDisplayData,
            calendarData: newCalendarData,
            graphData: newGraphData,
            workoutCounter: newWorkoutCounter
        });
    }

    //Izbrise opravljen trening z izbranim id-jem iz baze
    deleteCompletedTraining = (e) => {
        fetch('https://fitness-progress-tracker.herokuapp.com/delete_completed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: 
                JSON.stringify({ 
                    id: this.state.displayData[e.dateString].complete_id
                })
        }).then(res => {
            if (res.status !== 200) {
                ToastAndroid.showWithGravity("Failed!", ToastAndroid.LONG, ToastAndroid.BOTTOM);
                throw new Error('Failed!');
            }
            return res.json();
        }).then((response) => {
            console.log(response);
            ToastAndroid.showWithGravity("Successfully deleted.", ToastAndroid.LONG, ToastAndroid.BOTTOM);
            this.getData(); //Osvezimo stran, da se prikazejo pravilni podatki.
        }).catch((error) => {
            console.error(error);
            ToastAndroid.showWithGravity(error, ToastAndroid.LONG, ToastAndroid.BOTTOM);
        });
    }

    onLongPress = (e) => {
        if (this.state.displayData[e.dateString] != undefined){
            //Preverimo, ce je za tisti datum shranjen trening
            Alert.alert(
                'Delete training', //Naslov
                'Are you sure you want to delete the training?', //Tekst
                [
                    //Gumbi
                    {
                        text: 'NO',
                        onPress: () => console.log('NO Pressed'),
                        style: 'cancel',
                    },
                    {
                        text: 'YES', 
                        onPress: () => this.deleteCompletedTraining(e)

                    }
                ],
                {
                    //Ostale moznosti
                    cancelable: true,
                    onDismiss: () => {
                        console.log("Dismissed!");
                    }
                }
            );
        }
    }

    togglePopover = (e) => {
        if(this.state.popoverVisibility){
            //Zapremo popover
            this.setState({
                popoverVisibility: !this.state.popoverVisibility,
                selectedDate: null
            });
        }else {
            //Odpremo popover
            if(this.state.displayData[e.dateString] != undefined){
                //Preverimo, ce je za tisti datum shranjen trening
                this.setState({
                    popoverVisibility: !this.state.popoverVisibility,
                    selectedDate: e.dateString
                });
            }
        }
    }

    formatTimeString = (date) => {
        let result = date.toLocaleTimeString();
        result = result.substring(0, result.length-3)
        return result;
    }

    onRefresh = () => {
        this.getData();
    }

    goToEditPage = () => {
        let date = this.state.selectedDate;
        this.togglePopover();
        Actions.editCompleted({ editData: this.state.displayData[date] });
    }

    jsonToArray = () => {
        let json = this.state.displayData[this.state.selectedDate].weight;
        let array = [];
        for(let j in json){
            let text = j + " " + json[j].weight + " kg";
            array.push( text );
        }
        return array;
    }

    calendarHeader = () => {
        return( <CardHeader title="All completed workouts"/> );
    }

    lineChartHeader = () => {
        return( <CardHeader title="Progression"/> );
    }

    barChartHeader = () => {
        return( <CardHeader title="Most commonly done workouts"/> );
    }

    render(){

        const PopoverContent = () => (
            <Layout style={styles.popoverContent}>
                {this.state.displayData[this.state.selectedDate] ? (
                    <ScrollView>
                        <Layout>
                            <Text category='h5'>Workout name: {this.state.displayData[this.state.selectedDate].workout_name}</Text>
                            <Text category='h5'>Date: {new Date(this.state.displayData[this.state.selectedDate].start_time).toDateString()}</Text>
                            <Text category='h5'>Duration: {this.formatTimeString(new Date(this.state.displayData[this.state.selectedDate].start_time))} - {this.formatTimeString(new Date(this.state.displayData[this.state.selectedDate].finish_time))}</Text>
                            {this.state.displayData[this.state.selectedDate].weight && 
                                <Layout>
                                    <Text category='h5'>Excercises:</Text>
                                    <Layout style={styles.borderStyle}>
                                        {this.jsonToArray().map((d, i) => {
                                            return(
                                                <Text key={i}>{d}</Text>
                                            );
                                        })}
                                    </Layout>
                                </Layout>
                            }
                            {this.state.displayData[this.state.selectedDate].comment && (
                                <Layout>
                                    <Text category='h5'>Comment:</Text>
                                    <Layout style={styles.borderStyle}>
                                        <Text>{this.state.displayData[this.state.selectedDate].comment}</Text>
                                    </Layout>
                                </Layout>
                            )}
                        </Layout>
                        <Layout style={{ justifyContent: 'flex-end', flexDirection: 'row', paddingTop: 10 }}>
                            <Button appearance='outline' icon={EditIcon} onPress={this.goToEditPage}>EDIT</Button>
                        </Layout>
                    </ScrollView>
                ) : (
                    <Layout style={styles.spinner}>
                        <Spinner size='giant'/>
                    </Layout>
                )}
            </Layout>
        );

        return(
            <SafeAreaView>
                {this.state.calendarData ? (
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.onRefresh}
                            />
                        }
                        style={{height: '100%'}}>
                            <Popover
                                onBackdropPress={this.togglePopover}
                                visible={this.state.popoverVisibility}
                                content={PopoverContent()}
                                backdropStyle={styles.backDrop}>
                                    <Layout></Layout>
                            </Popover>

                            <Card header={this.calendarHeader}>
                                <Calendar 
                                    showWeekNumbers={true}
                                    hideExtraDays={true}
                                    onDayLongPress={this.onLongPress}
                                    onDayPress={this.togglePopover}
                                    minDate={"2020-01-31"}
                                    markedDates={this.state.calendarData}/>
                            </Card>
                            
                            <Card header={this.lineChartHeader}>
                                <LineChartComponent 
                                    data={this.state.graphData}/>
                            </Card>

                            <Card header={this.barChartHeader}>
                                <BarChartComponent 
                                    data={this.state.workoutCounter}/>
                            </Card>
                    </ScrollView>
                ) : (
                    <Layout style={styles.spinner}>
                        <Spinner size="giant" />
                    </Layout>
                )}
            </SafeAreaView>
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
        padding: 30,
        height: Dimensions.get("window").height * 0.8,
        width: Dimensions.get("window").width * 0.8
    },
    borderStyle: {
        borderWidth: StyleSheet.hairlineWidth, 
        borderColor: 'gray', 
        borderRadius: 5, 
        padding: 10
    }
});