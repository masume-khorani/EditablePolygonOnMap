

import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE, MAP_TYPES, Polygon, Marker } from 'react-native-maps';
import _ from 'lodash';
import Entypo from "react-native-vector-icons/Entypo";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { getCenter } from 'geolib';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
const LATITUDE = 32.4207;
const LONGITUDE = 53.6830;
const LATITUDE_DELTA = 25;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let id = 0;

class PolygonOnMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMyLocation: false,
            initialRegion: {
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            },
            id: 0,
            coordinates: [],
            editing: null,
            markerIndex: null,
            showUndoIcon: false,
            showDeleteIcon: false,
        }
        this.handleMapReady = this.handleMapReady.bind(this);
        this.selectUndo = this.selectUndo.bind(this);
    }


    handleMapReady() {
        this.map.map.setNativeProps({ style: { ...styles.map, marginLeft: 0 } })
    }

    onPressMap(e) {
        const newPoint = e.nativeEvent.coordinate;
        let points = [];
        if (this.state.coordinates.length > 0) {
            const lastPoint = _.last(this.state.coordinates);
            const middlePoint = getCenter([lastPoint, newPoint]);
            points = [...this.state.coordinates, middlePoint, newPoint];
        } else {
            points = [...this.state.coordinates, newPoint];
        }
        this.setState({
            id: id++,
            coordinates: points,
            showUndoIcon: true,
            showDeleteIcon: true
        });
    }
    markerDrag(e) {
        const newPoint = e.nativeEvent.coordinate;
        if (this.state.coordinates.length > 1) {
            let dragPoints = this.state.coordinates.slice(0);
            dragPoints[this.state.markerIndex] = newPoint;
            this.setState({
                id: id++,
                coordinates: dragPoints
            });
        } else {
            this.setState({
                id: id++,
                coordinates: [newPoint],
            });
        }
    }
    markerStartPress(m) {
        const index = this.state.coordinates.indexOf(m);
        this.setState({
            markerIndex: index
        })
    }
    selectUndo = () => {
        let coordinatesLenght = this.state.coordinates.length;
        if (coordinatesLenght > 1) {
            let undoCoordinates = this.state.coordinates.slice(0, coordinatesLenght - 1);
            this.setState({
                coordinates: undoCoordinates
            })
        } else {
            this.setState({
                coordinates: [],
                showUndoIcon: false,
                showDeleteIcon: false,
            })
        }
    }
    pressDeletePolygon = () => {
        this.setState({
            showDeleteIcon: false,
            coordinates: [],
            showUndoIcon: false
        })
    }
    render() {
        const mapOptions = {
            scrollEnabled: true,
        };
        if (this.state.editing) {
            mapOptions.scrollEnabled = false;
            mapOptions.onPanDrag = e => this.onPressMap(e);
        }
        return <View style={styles.container}>
                <MapView
                    ref={(el) => { this.map = el }}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={this.state.initialRegion}
                    showsUserLocation={true}
                    mapType={MAP_TYPES.HYBRID}
                    showsCompass={true}
                    zoomControlEnabled={true}
                    onMapReady={this.handleMapReady}
                    onPress={e => this.onPressMap(e)}
                    {...mapOptions}>
                    {this.state.coordinates.length > 0 && <Polygon
                        key={this.state.id}
                        coordinates={this.state.coordinates}
                        fillColor='rgba(89,128,24, 0.1)'
                        strokeColor="#ed5858"
                    />}
                    {this.state.coordinates.length > 0 && this.state.coordinates.map((m, i) => (
                            <Marker
                                draggable
                                onDrag={(e) => this.markerDrag(e)}
                                onDragStart={() => this.markerStartPress(m)}
                                key={i}
                                coordinate={m} >
                                <Entypo
                                    name="circle"
                                    color='#ed5858'
                                    size={wp('5%')} />
                            </Marker>))
                    }
                </MapView>
                {this.state.showUndoIcon &&
                    <View style={styles.selectUndoContainer}>
                        <TouchableOpacity
                            onPress={this.selectUndo}
                            style={[styles.selectUndoButton,]}>
                            <EvilIcons
                                name="undo"
                                color='#313833'
                                size={wp('8%')} />
                        </TouchableOpacity>
                    </View>}
                {this.state.showDeleteIcon &&
                    <View style={styles.selectDeleteContainer}>
                        <TouchableOpacity
                            onPress={this.pressDeletePolygon}
                            style={[styles.selectDeleteButton]}>
                            <EvilIcons
                                name="trash"
                                color='#313833'
                                size={wp('8%')} />
                        </TouchableOpacity>
                    </View>}
        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
        marginLeft: 1
    },
    selectUndoContainer: {
        position: 'absolute',
        bottom: 17,
        left: wp('44%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectUndoButton: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        padding: 10,
        width: wp('20%'),
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255, 0.7)',
    },
    selectUndoText: {
        textAlign: 'center',
        fontFamily: 'Vazir',
        color: 'rgba(49,56,51, 0.5)'
    },
    selectDeleteContainer: {
        position: 'absolute',
        bottom: 17,
        left: wp('65%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectDeleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        padding: 10,
        width: wp('20%'),
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255, 0.7)',
    },
    selectDeleteText: {
        textAlign: 'center',
        fontFamily: 'Vazir',
        color: 'rgba(49,56,51, 0.5)'
    }
});
export default PolygonOnMap;
