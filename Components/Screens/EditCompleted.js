import React, { Component } from "react";
import { StyleSheet, SafeAreaView, ScrollView, ToastAndroid } from 'react-native';
import { Button, Icon, Card, Select, Input, CardHeader, Layout, Popover, Menu, Text } from "@ui-kitten/components";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Actions } from "react-native-router-flux";

const SaveIcon = (style) => ( <Icon {...style} name='save-outline'/> );
const CancelIcon = (style) => ( <Icon {...style} name='close-outline'/> );
const ClockIcon = (style) => ( <Icon {...style} name='clock-outline'/> );
const CheckIcon = (style) => ( <Icon {...style} name='checkmark-outline'/> );

export default class EditCompleted extends Component {

    constructor(props){
        super(props);
        this.state = {
            showStartTimePicker: false,
            chosenStartHour: new Date(this.props.editData.start_time),

            showFinishTimePicker: false,
            chosenFinishHour: new Date(this.props.editData.finish_time),

            data: null,
            selectedWorkout: {
                id: this.props.editData.workout_id, 
                text: this.props.editData.workout_name
            },

            chosenExcercises: this.jsonToArray()[0],
            chosenExcerciseNames: this.jsonToArray()[1],
            selectedExcercise: null,
            popoverVisibility: false,
            weight: null,
            excercisesForWorkout: null,

            comment: this.props.editData.comment
        }

        this.getExcercisesForWorkout(this.state.selectedWorkout.id);
        this.query();
    }

    //Preoblikuje podatke v obliko, primerno za Select.
    formatData = (data) => {
        let workoutNames = [];
        for(let i in data){
            workoutNames.push({ text: data[i].name, id: data[i].id });
        }
        return workoutNames;
    }

    //Pridobi podatke o vseh razpolozljvih treningih.
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

    setSelectedWorkout = (e) => {
        this.setState({
            selectedWorkout: e,
            chosenExcercises: [],
            chosenExcerciseNames: []
        });
    };

    setComment = (e) => {
        this.setState({
            comment: e
        });
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

    //Funkciji za izpis casa v primernem formatu
    formatStartTimeString = () => {
        let result = this.state.chosenStartHour.toLocaleTimeString()
        result = result.substring(0, result.length-3)
        return result;
    }

    formatFinishTimeString = () => {
        let result = this.state.chosenFinishHour.toLocaleTimeString()
        result = result.substring(0, result.length-3)
        return result;
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

    //Funkcija, ki posodobi uro pricetka treninga, glede na izbor uporabnika.
    onChangeStartTime = (event, selectedDate) => {
        if(event.type != 'dismissed'){
            this.setState({
                chosenStartHour: selectedDate
            });
        }
        if(this.state.showStartTimePicker == true) this.setState({ showStartTimePicker: false });
    }

    //Funkcija, ki posodobi uro pricetka treninga, glede na izbor uporabnika.
    onChangeFinishTime = (event, selectedDate) => {
        if(event.type != 'dismissed'){
            this.setState({
                chosenFinishHour: selectedDate
            });
        }
        if(this.state.showFinishTimePicker == true) this.setState({ showFinishTimePicker: false });
    }

    /**
     * Spreminjanje vaj
     */

    reEnterTheData = (excercises) => {
        let array = [];
        for(let i in excercises){
            const DeleteIcon = this.iconWithIndex(i);
            array.push({ title: excercises[i].title, id: excercises[i].id, weight: excercises[i].weight, icon: DeleteIcon, name: excercises[i].name });
        }
        return array;
    }

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

    iconWithIndex = (index) => {
        const DeleteIcon = (style) => ( <Icon {...style} name='trash-2-outline' onPress={this.deleteMenuItem} i={index}/> );
        return DeleteIcon;
    }

    jsonToArray = () => {
        let json = this.props.editData.weight;
        let array = [];
        let array02 = [];
        let index = 0;
        for(let j in json){
            const DeleteIcon = this.iconWithIndex(index);
            index += 1;
            let text = j + " " + json[j].weight + " kg";
            array.push({ title: text, id: json[j].excercise_id, weight: json[j].weight, icon: DeleteIcon, name: j });
            array02.push(j);
        }
        return [array, array02];
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

    chosenExcercisesToJson = () => {
        let jsonFormat = {};
        for(let i in this.state.chosenExcercises){
            jsonFormat[this.state.chosenExcercises[i].name] = { "weight": this.state.chosenExcercises[i].weight, "excercise_id": this.state.chosenExcercises[i].id };
        }
        return jsonFormat;
    }

    /**
     * Potjevanje sprememb
     */

    commitChanges = () => {
        fetch('https://fitness-progress-tracker.herokuapp.com/update_completed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                    id: this.props.editData.complete_id,
                    start_time: this.state.chosenStartHour,
                    finish_time: this.state.chosenFinishHour,
                    workout_id: this.state.selectedWorkout.id,
                    comment: this.state.comment,
                    weight: this.chosenExcercisesToJson()
                })
        }).then(res => {
            if (res.status !== 200) {
                ToastAndroid.showWithGravity("Failed!", ToastAndroid.LONG, ToastAndroid.BOTTOM);
                throw new Error('Failed!');
            }
            return res.json();
        }).then((response) => {
            console.log(response);
            ToastAndroid.showWithGravity("Successfully edited.", ToastAndroid.LONG, ToastAndroid.BOTTOM);
        }).catch((error) => {
            console.log(error);
            ToastAndroid.showWithGravity(error, ToastAndroid.LONG, ToastAndroid.BOTTOM);
        });
    }

    save = () => {
        if(this.state.comment != null){
            if(this.state.comment.trim().length == 0){
                this.state.comment = null;
            }
        }
        this.commitChanges();
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

        return(
            <SafeAreaView style={styles.container}>
                <ScrollView>

                    {this.state.showStartTimePicker && (
                        <DateTimePicker 
                            value={this.state.chosenStartHour}
                            timeZoneOffsetInMinutes={this.state.chosenStartHour.getTimezoneOffset()}
                            mode="time"
                            display="spinner"
                            is24Hour={true}
                            onChange={this.onChangeStartTime}/>
                    )}

                    {this.state.showFinishTimePicker && (
                        <DateTimePicker 
                            value={this.state.chosenFinishHour}
                            timeZoneOffsetInMinutes={this.state.chosenFinishHour.getTimezoneOffset()}
                            mode="time"
                            display="spinner"
                            is24Hour={true}
                            onChange={this.onChangeFinishTime}/>
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
                            ref="commentEdit"
                            placeholder="Comment"
                            value={this.state.comment}
                            onChangeText={this.setComment}/>
                    </Card>

                    <Layout style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                        <Button icon={CancelIcon} onPress={() => Actions.pop()}>CANCEL</Button>
                        <Button icon={SaveIcon} onPress={this.save}>SAVE</Button>
                    </Layout>
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
    backDrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    popoverContent: {
        padding: 30
    }
});