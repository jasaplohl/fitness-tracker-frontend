import React, { Component } from "react";
import { StyleSheet, Dimensions } from 'react-native';
import { Layout, Spinner, Select } from "@ui-kitten/components";

import { LineChart } from 'react-native-chart-kit';

export default class LineChartComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            excercisesMap: null,
            chosenExcerciseDisplay: null, //Trenutno prikazana vaja na grafu
            selectData: null //Podatki za uporabljen select
        }
    }

    componentDidMount(){
        this.createExcercisesMap(this.props.data);
    }

    createExcercisesMap = (data) => {
        let map = {};
        let select = [];
        for(let i in data){
            for(let j in data[i].excercises){
                if(map[j] == undefined) {
                    map[j] = { dates: [i], weights: [data[i].excercises[j].weight] };
                }else{
                    map[j].dates.push(i);
                    map[j].weights.push(data[i].excercises[j].weight);
                }
            }
        }

        //Izlocimo tiste vaje, pri katerih imamo shranjen le en podatek o tezi
        for(let i in map){
            if(map[i].dates.length < 2)
                delete map[i];
            else
                select.push({ text: i });
        }
        
        this.setState({
            excercisesMap: map,
            selectData: select,
            chosenExcerciseDisplay: select[0] //najprej izberemo prvo vajo iz seznama
        });
    }

    //Ko izberemo vajo na selectu, se posodobi graf
    excerciseOnSelect = (e) => {
        this.setState({
            chosenExcerciseDisplay: e
        })
    }

    render() {

        const chartConfig = {
            backgroundGradientFrom: "#0000ff",
            backgroundGradientTo: "#cbf8ff",
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            strokeWidth: 2, // optional, default 3
            propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#cbf8ff"
            }
        }

        return(
            <Layout>
                {(this.state.selectData && this.state.chosenExcerciseDisplay) && (
                    <Select
                        placeholder="Excercise"
                        data={this.state.selectData}
                        selectedOption={this.state.chosenExcerciseDisplay}
                        onSelect={this.excerciseOnSelect}/>
                )}
                {(this.state.excercisesMap && this.state.chosenExcerciseDisplay) ? (
                    <LineChart
                        data={{
                            datasets: [
                                {
                                    data: this.state.excercisesMap[this.state.chosenExcerciseDisplay.text].weights
                                }
                            ]
                        }}
                        width={Dimensions.get("window").width} //Width of the window, from react-native
                        height={250}
                        yAxisSuffix=" kg"
                        yAxisInterval={1} // optional, defaults to 1
                        chartConfig={chartConfig}
                        bezier //Da narise krivuljo in ne ravno crto
                        style={{
                            marginVertical: 8,
                            borderRadius: 16
                        }}
                    />
                ): (
                    <Layout style={styles.spinner}>
                        <Spinner size='giant' />
                    </Layout>
                )}
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    spinner: {
        justifyContent: 'center',
        alignItems: 'center'
    }
});