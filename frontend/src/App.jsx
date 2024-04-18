import { useState, useRef } from "react";
import { useEffect } from "react";
import {Camera} from "react-camera-pro";
import { image_analysis } from "./util";

const App = () => {
    const camera = useRef(null);
    const [image, setImage] = useState(null);
    const cameraStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        height: "100%",
        width: "100%",
    }

    useEffect(() => {
        console.log('image taken');
        async function run() {
            const response = await image_analysis(image)
            console.log(response)
        }
        run();
    }, [image])

    return (
        
        <div>
            <div style={cameraStyle}
                 onTouchStart={
                () => {
                    // works!
                    console.log("touched");
                    setImage(camera.current.takePhoto())
                }}
                 onTouchEnd={
                    // works!
                     () =>{

                    console.log("released");
                 }}

            >
                <Camera ref={camera} errorMessages={{noCameraAccessible:"No Camera Accessible", permissionDenied:"Permission Denied"}}/>
                <img style={{display:"fixed"}} src={image} alt='Taken photo'/>
            </div>

        </div>

    );
}

export default App;