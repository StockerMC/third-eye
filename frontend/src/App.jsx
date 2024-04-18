import React, { useState, useRef } from "react";
import {Camera} from "react-camera-pro";

const App = () => {
    const camera = useRef(null);
    const [image, setImage] = useState(null);

    return (
        <div>
            <Camera ref={camera}/>

            // these elements are currently hidden behind the camera, need to change display type
            <button onClick={() => {
                if(camera.current) {
                    const photo = camera.current.takePhoto();
                    setImage(photo);
                }
            }}>Take photo</button>
            <img src={image} alt='Taken photo'/>

        </div>
    );
}

export default App;