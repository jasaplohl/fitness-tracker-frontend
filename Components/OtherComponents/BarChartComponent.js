import React, { Component } from "react";
import { Layout, Spinner } from "@ui-kitten/components";
import { Dimensions } from 'react-native';

import { BarChart } from 'react-native-chart-kit';

export default class BarChartComponent extends Component {

    state = {
        labels: null,
        data: null
    }

    componentDidMount() {
        this.formatData(this.props.data);
    }

    formatData = (data) => {
        let newLabels = [];
        let newData = [];
        for(let i in data){
            newLabels.push(i);
            newData.push(data[i]);
        }
        this.setState({
            labels: newLabels,
            data: newData
        });
    }

    render() {
        return(
            <Layout>
                {(this.state.data && this.state.labels) ? (
                    <BarChart
                        data={{
                            labels: this.state.labels,
                            datasets: [
                                {
                                    data: this.state.data,
                                },
                            ],
                        }}
                        width={Dimensions.get('window').width}
                        height={250}
                        chartConfig={{
                            backgroundGradientFrom: '#0000ff',
                            backgroundGradientTo: '#ffffff',
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
                        }}
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                            color: '#ffffff'
                        }}
                    />
                ) : (
                    <Layout>
                        <Spinner size='giant' />
                    </Layout>
                )}
            </Layout>
        );
    }
}