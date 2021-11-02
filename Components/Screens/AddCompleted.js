import React, { Component } from "react";
import { SafeAreaView, StyleSheet, ToastAndroid } from "react-native";
import { Datepicker, Button, Select, Icon, Input, Card, CardHeader, Menu, Popover, Layout, Text } from "@ui-kitten/components";
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScrollView } from "react-native-gesture-handler";

const CheckIcon = (style) => ( <Icon {...style} name='checkmark-outline'/> );
const ClockIcon = (style) => ( <Icon {...style} name='clock-outline'/> );

export default class AddCompleted extends Component {

    constructor(props){
        super(props);

        let timeZone = new Date().getTimezoneOffset()/60; //izracunamo casovni zamik

        this.state = {
            chosenDate: new Date(),

            showStartTimePicker: false,
            chosenStartHour: new Date(),

            showFinishTimePicker: false,
            chosenFinishHour: new Date(),

            timeZoneOffset: timeZone,

            data: null, //Vsi razpolozljivi treningi
            selectedWorkout: null,

            excercisesForWorkout: null,
            chosenExcercises: [],
            chosenExcerciseNames: [],
            selectedExcercise: null,
            popoverVisibility: false,
            weight: null,

            comment: null,

            buttonDisabled: true
        }
        this.query();
    }

    onChosenDate = (date) => {
        this.setState({
            chosenDate: date
        });
    }

    //Funkciji za odpiranje time pickerja
    openStartTimePicker = () => {
        this.setState({
            showStartTimePicker: true
        });
    }

    openFinishTimePicker = () => {
        this.setState({
            showFinishTimePicker: true
        });
    }

    //Funkcija, ki posodobi uro pricetka in konca treninga, glede na izbor uporabnika.
    onChange = (event, selectedDate) => {
        if(event.type != 'dismissed'){
            if(this.state.showStartTimePicker){
                this.setState({
                    chosenStartHour: selectedDate,
                    showStartTimePicker: false
                });
            }else{
                this.setState({
                    chosenFinishHour: selectedDate,
                    showFinishTimePicker: false
                });
            }
        }
        if(this.state.showStartTimePicker == true) this.setState({ showStartTimePicker: false });
        else if(this.state.showFinishTimePicker == true) this.setState({ showFinishTimePicker: false });
    }

    //Funkciji za izpis casa v primernem formatu
    formatStartTimeString = () => {
        let result = this.state.chosenStartHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        result = result.substring(0, result.length-3)
        return result;
    }

    formatFinishTimeString = () => {
        let result = this.state.chosenFinishHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        result = result.substring(0, result.length-3)
        return result;
    }

    formatData = (data) => {
        let workoutNames = [];
        for(let i in data){
            workoutNames.push({ text: data[i].name, id: data[i].id });
        }
        return workoutNames;
    }

    //Vrne vse razpolozljive treninge
    query = () => {
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

    //Vrne vse vaje za podan trening
    getExcercisesForWorkout = (workoutId) => {
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
                excercisesForWorkout: this.formatData(response)
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    setSelectedWorkout = (e) => {
        this.getExcercisesForWorkout(e.id);
        this.setState({
            selectedWorkout: e,
            buttonDisabled: false, //Preden izberemo trening, ne moramo shraniti podatkov
            chosenExcercises: [], //Da ne moramo izbirati vaj iz razlicnih treningov
            chosenExcerciseNames: []
        });
    };

    //Ko izberemo vajo v selectu
    excerciseOnSelect = (e) => {
        if(!this.state.chosenExcerciseNames.includes(e.text)){
            this.setState({
                popoverVisibility: true,
                selectedExcercise: e
            });
        }
    }

    //Ko kliknemo na shranjeno vajo
    excerciseMenuItemOnSelect = (e) => {
        console.log(this.state.chosenExcercises[e]);
    }

    closePopover = () => {
        this.setState({
            popoverVisibility: false
        });
    }

    setWeight = (e) => {
        this.setState({
            weight: e
        });
    }

    //Ko uporabnik klikne gumb OK v popover oknu
    saveTheWeight = () => {
        if(this.state.weight != null && this.state.weight != 0){ //Ce uporabnik ni vnesel teze
            let index = this.state.chosenExcercises.length;
            const DeleteIcon = (style) => ( <Icon {...style} name='trash-2-outline' onPress={this.deleteMenuItem} i={index}/> );

            this.closePopover();

            let array = this.state.chosenExcercises;
            let text = this.state.selectedExcercise.text + " " + this.state.weight + " kg"; //Zapis v meniju
            array.push({ title: text, id: this.state.selectedExcercise.id, weight: this.state.weight, icon: DeleteIcon, name: this.state.selectedExcercise.text });

            //Posebaj hranimo se imena izbranih vaj, da do njih lazje dostopamo, ko preverjamo, ce je dolocena vaja ze izbrana
            let array02 = this.state.chosenExcerciseNames;
            array02.push(this.state.selectedExcercise.text);

            this.setState({
                chosenExcercises: array,
                chosenExcerciseNames: array02,
                weight: null
            });
        } else {
            ToastAndroid.showWithGravity("Please put in a valid number.", ToastAndroid.LONG, ToastAndroid.BOTTOM);
        }
    }

    iconWithIndex = (index) => {
        const DeleteIcon = (style) => ( <Icon {...style} name='trash-2-outline' onPress={this.deleteMenuItem} i={index}/> );
        return DeleteIcon;
    }

    reEnterTheData = (excercises) => {
        let array = [];
        for(let i in excercises){
            const DeleteIcon = this.iconWithIndex(i);
            array.push({ title: excercises[i].title, id: excercises[i].id, weight: excercises[i].weight, icon: DeleteIcon, name: excercises[i].name });
        }
        return array;
    }

    //Izbrise izbrano vajo iz seznama
    deleteMenuItem = (e) => {
        let index = e._dispatchInstances._debugOwner.child.memoizedProps.i;

        let array = this.state.chosenExcercises;
        array.splice(index, 1);
        let array02 = this.state.chosenExcerciseNames;
        array02.splice(index, 1);

        this.setState({
            chosenExcercises: this.reEnterTheData(array),
            chosenExcerciseNames: array02
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
        return date.getFullYear() + "-" + month + "-" + day
    }

    setComment = (e) => {
        this.setState({
            comment: e
        });
    }

    chosenExcercisesToJson = () => {
        let jsonFormat = {};
        for(let i in this.state.chosenExcercises){
            jsonFormat[this.state.chosenExcercises[i].name] = { "weight": this.state.chosenExcercises[i].weight, "excercise_id": this.state.chosenExcercises[i].id };
        }
        return jsonFormat;
    }

    //Ko zakljucimo z vpisovanjem podatkov
    addCompletedTraining = () => {
        //Zdruzimo izbran datum in izbrani uri

        let startTime = new Date();
        startTime.setFullYear(this.state.chosenDate.getFullYear());
        startTime.setMonth(this.state.chosenDate.getMonth());
        startTime.setDate(this.state.chosenDate.getDate());
        startTime.setHours(this.state.chosenStartHour.getHours());
        startTime.setMinutes(this.state.chosenStartHour.getMinutes());
        
        let finishTime = new Date();
        finishTime.setFullYear(this.state.chosenDate.getFullYear());
        finishTime.setMonth(this.state.chosenDate.getMonth());
        finishTime.setDate(this.state.chosenDate.getDate());
        finishTime.setHours(this.state.chosenFinishHour.getHours());
        finishTime.setMinutes(this.state.chosenFinishHour.getMinutes());

        this.chosenExcercisesToJson();

        //Shranimo v bazo
        this.insertCompletedTraining(startTime, finishTime, this.state.selectedWorkout.id, this.chosenExcercisesToJson());

        this.setState({
            chosenDate: new Date(),
            chosenStartHour: new Date(),
            chosenFinishHour: new Date(),
            selectedWorkout: null,
            excercisesForWorkout: null,
            chosenExcercises: [],
            chosenExcerciseNames: [],
            selectedExcercise: null,
            weight: null,
            comment: null,
            buttonDisabled: true
        });

        //Pobrisemo tekst iz inputa.
        this.refs["comment"].textInputRef.current.clear();
    }

    insertCompletedTraining = (startTime, finishTime, workoutId, weightJSON) => {
        fetch('https://fitness-progress-tracker.herokuapp.com/completed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                    start_time: startTime,
                    finish_time: finishTime,
                    workout_id: workoutId,
                    comment: this.state.comment,
                    weight: weightJSON
                })
        }).then(res => {
            if (res.status !== 200) {
                ToastAndroid.showWithGravity("Failed!", ToastAndroid.LONG, ToastAndroid.BOTTOM);
                throw new Error('Failed!');
            }
            return res.json();
        }).then((response) => {
            console.log(response);
            ToastAndroid.showWithGravity("Successfully added.", ToastAndroid.LONG, ToastAndroid.BOTTOM);
        }).catch((error) => {
            console.log(error);
            ToastAndroid.showWithGravity(error, ToastAndroid.LONG, ToastAndroid.BOTTOM);
        });
    }

    dateHeader = () => {
        return( <CardHeader title="Select the date"/> );
    }

    startTimeHeader = () => {
        return( <CardHeader title="Set the start time"/> );
    }

    finishTimeHeader = () => {
        return( <CardHeader title="Set the finish time"/> );
    }

    pickWorkoutHeader = () => {
        return( <CardHeader title="Pick the workout"/> );
    }

    pickExcercisesHeader = () => {
        return( <CardHeader title="Pick the excercises"/> );
    }

    commentHeader = () => {
        return( <CardHeader title="Comment"/> );
    }

    render(){

        const PopoverContent = () => (
            <Layout style={styles.popoverContent}>
                {this.state.selectedExcercise && (
                    <Text>{this.state.selectedExcercise.text}</Text>
                )}
                <Input 
                    keyboardType="number-pad"
                    placeholder="Weight"
                    label="Put in the weight"
                    onChangeText={this.setWeight}/>
                <Button icon={CheckIcon} onPress={this.saveTheWeight}>OK</Button>
            </Layout>
        );

        return (
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <Card header={this.dateHeader}>
                        <Datepicker
                            date={this.state.chosenDate}
                            onSelect={this.onChosenDate}/>
                    </Card>

                    
                    {(this.state.showStartTimePicker || this.state.showFinishTimePicker) && (
                        <DateTimePicker 
                            value={new Date()}
                            timeZoneOffsetInMinutes={new Date().getTimezoneOffset()}
                            mode="time"
                            display="spinner"
                            is24Hour={true}
                            onChange={this.onChange}/>
                    )}

                    <Card header={this.startTimeHeader}>
                        <Button appearance='outline' onPress={this.openStartTimePicker} icon={ClockIcon}>{this.formatStartTimeString()}</Button>
                    </Card>
                    
                    <Card header={this.finishTimeHeader}>
                        <Button appearance='outline' onPress={this.openFinishTimePicker} icon={ClockIcon}>{this.formatFinishTimeString()}</Button>
                    </Card>

                    <Card header={this.pickWorkoutHeader}>
                        <Select
                            placeholder="Workout"
                            style={styles.formItem}
                            data={this.state.data}
                            selectedOption={this.state.selectedWorkout}
                            onSelect={this.setSelectedWorkout} />
                    </Card>

                    <Popover
                        onBackdropPress={this.closePopover}
                        visible={this.state.popoverVisibility}
                        content={PopoverContent()}
                        backdropStyle={styles.backDrop}
                        placement="top">
                            <Layout>
                                {this.state.excercisesForWorkout && (
                                    <Card header={this.pickExcercisesHeader}>
                                        <Select
                                            placeholder="Excercise"
                                            data={this.state.excercisesForWorkout}
                                            selectedOption={null}
                                            onSelect={this.excerciseOnSelect} />

                                        {(this.state.chosenExcercises) && (
                                            <Menu
                                                data={this.state.chosenExcercises}
                                                onSelect={this.excerciseMenuItemOnSelect}
                                                />
                                        )}
                                    </Card>
                                )}
                            </Layout>
                    </Popover>

                    <Card header={this.commentHeader}>
                        <Input
                            ref="comment"
                            style={styles.formItem}
                            placeholder="Comment"
                            onChangeText={this.setComment}/>
                    </Card>

                    <Button 
                        onPress={this.addCompletedTraining}
                        icon={CheckIcon}
                        disabled={this.state.buttonDisabled}>DONE</Button>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between"
    },
    textStyle: {
        textAlign: "center"
    },
    formItem: {
      marginBottom: 15,
    },
    backDrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    popoverContent: {
        padding: 30
    }
});