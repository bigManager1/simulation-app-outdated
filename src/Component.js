import {useEffect, useState } from "react";
import axios from 'axios';
import "./App.css";
import { CSVLink} from "react-csv";
function Component() {
    // the url shows the user where the api is deployed - data is accessable from there
    const url = "https://shrouded-hamlet-51189.herokuapp.com";

    // a panel is setup to be mapped to div elements with different values
    const panelSetup  = Array.from(Array(100).keys());

    // the hooks represent states under which the functions will operate, or the panels will be
    // mapped from the api resource
    const [ongoing, setOngoing] = useState(false);
    const [sensorsData, setSensorsData] = useState([]);
    const [pins,setPins] = useState([]);
    // an initial value of 0.0 is initialized for the cursor
    const [Ycoord, setYcoord] = useState("0.0");
    
    // the function fetches all the Pin resource representations from the api
    async function fetchPins(){// get call to map buttons
      await axios.get(url+'/pins')
      .then(result => setPins(result.data));
    }
  
    // the function turns the pin value to 'On' by using a patch call and changing the value of the pin
    function pinOn(name){ // patch to put another pin in
      axios.patch(url+'/pins/' +name ,{
        pinValue: true, // setting pin value to 1, to signify that the pin is active
      }).catch((error) => console.log('Error: ', error))
      fetchPins();
    }
  
    // alternatively, the value can be set to false in an effort to turn the pin off
    function pinOff(name){ // patch to put pin off
      axios.patch(url+'/pins/' +name ,{
        pinValue: false,
      }).catch((error) => console.log('Error: ', error))
      fetchPins();
    }

    // for the coordinate tracking sensor simulation, this function sets the value of the cursor
    // to be patched into the sensor api.
    function register(coord){
        axios.patch(url+'/sensors/heightSensor',{
            sensorValue: coord,
        }).catch((error) => console.log('Error: ', error))
        sensorsData.push(coord);
    }

    // the pin value is changed
    function pushValue(coord){
        setYcoord(coord);
    }

    // this function sets the 'Ongoing' hook to true
    function start(){
        setOngoing(true);
    }

    // this function cleans the array where the sensor values are collected and turns off the 
    // 'Ongoing' hook by setting it to false
    function stop(){
        setSensorsData([]);
        setOngoing(false);
    }

    // useEffect is a hook that is executing it's contents repeatedly.
    // first, we make sure we are shown the freshest api value representation by fetching the pins,
    // for the pin simulation
    // for the sensor simulation, we initialize a timing variable and set it to null in the begining.
    // when the ongoing hook is activated, we fire off the 'register' function every 1000 ms (1s)
    // when the ongoing hook is deactivated, timing is cleared.
    useEffect(() => {
        fetchPins();
        let timing = null;
        (ongoing?
            timing = setInterval(() => register(Ycoord), 1000)
            :
            clearInterval(timing)
        )
        return () => clearInterval(timing);
      }, [ongoing,Ycoord]);
  
    return (
      <div class="main"> 
        <div class="half">
          <h1>Pin simulation</h1>
          <p>The boolean value of the pin is rendered from the api (via GET call). If the value happens to
              be "true", then we can see the pin is <b>On</b> and vice versa. When the button is 
              clicked, an api call is made to update the value to an opposite boolean value.
          </p> 
          {pins.map(pin =>  
          <ul class = "pinDisplay">
          <ul key= {pin.id} >
          Pin {pin.pinName} is 
          {pin.pinValue
          ? 
          <div>
          <b>On</b>
          <button class="off" onClick={()=> pinOff(pin.pinName)}>Double click to Turn off</button>
          </div>
          : 
          <div>
          <b>Off</b>
          <button class="on" onClick={()=> pinOn(pin.pinName)}>Double click to Turn on</button>
          </div>
          }
          </ul>
          </ul>
          )}
  
        </div>
        <div class="half">
        <h1>Sensor simulation</h1>
        <p>
            Instead of a temperature sensor, the following simulation will measure the position of the 
            y coordinate of the mouse at a specified field (below). Clicking the button will trigger 
            a panel to open up - every second the y coordinate of the cursor with regards to the panel
            is collected and the sensor value is changed in the API (via a PATCH call).
            The process will last from clicking 'start' to clicking 'stop'. A CSV file containing the values can then be downloaded.
        </p>
        

        <button onClick= {()=> start()}>Start</button>
        <button onClick= {()=> stop()}>Stop</button>
        <CSVLink data={sensorsData.toString()}>Download the changes</CSVLink>
        <p>Current sensor value: {Ycoord}</p>
        <p>Current collected information {sensorsData.toString()}</p>

        {panelSetup.map(panel => 
            <div style={{backgroundColor: "rgba(200, 0, 0," + (parseFloat((panel/100).toFixed(2))).toString()+")" , height: "2px"}} class="strip" onMouseOver = {() => pushValue(parseFloat((panel/100).toFixed(2)))}>
                {panel%10==0 ?
                <small>0.{panel}</small>
                :
                null}
            </div>)}
        </div>
      </div>
    );
  }
  
  export default Component;