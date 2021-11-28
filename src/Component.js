import {useEffect, useState } from "react";
import axios from 'axios';
import "./App.css";
import { CSVLink, CSVDownload } from "react-csv";
function Component() {

    const url = "https://shrouded-hamlet-51189.herokuapp.com";
    const panelSetup  = Array.from(Array(100).keys());
    const [ongoing, setOngoing] = useState(false);
    const [sensorsData, setSensorsData] = useState([]);
  
    const [pins,setPins] = useState([]);
    const [sensors,setSensors] = useState([]);
    const [Ycoord, setYcoord] = useState("0.0");
    
    async function fetchPins(){// get call to map buttons
      await axios.get(url+'/pins')
      .then(result => setPins(result.data));
    }

    async function fetchSensors(){// get call to map buttons
        await axios.get(url+'/sensors')
        .then(result => setSensors(result.data));
      }
  
    function pinOn(name){ // patch to put another pin in
      axios.patch(url+'/pins/' +name ,{
        pinValue: true, // setting pin value to 1, to signify that the pin is active
      }).catch((error) => console.log('Error: ', error))
      fetchPins();
    }
  
    function pinOff(name){ // patch to put pin off
      axios.patch(url+'/pins/' +name ,{
        pinValue: false,
      }).catch((error) => console.log('Error: ', error))
      fetchPins();
    }

    function register(coord){
        axios.patch(url+'/sensors/heightSensor',{
            sensorValue: coord,
        }).catch((error) => console.log('Error: ', error))
        sensorsData.push(coord);
        fetchSensors();
    }

    function pushValue(coord){
        setYcoord(coord);
    }

    function start(){
        setOngoing(true);
    }

    function stop(){
        setSensorsData([]);
        setOngoing(false);
    }

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