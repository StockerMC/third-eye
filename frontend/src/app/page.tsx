'use client';

import { useState, useRef } from "react";
import { useEffect } from "react";
import {Camera} from "react-camera-pro";
import { image_analysis } from "./util";
// import { image_analysis } from "./util";

export default function Page() {
    const camera = useRef(null);
    const [image, setImage] = useState<string | null>(null);

    const [width, setWidth] = useState<number>(1920);

    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        setWidth(window.innerWidth)
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    const isMobile = width <= 768;

    useEffect(() => {
        // console.log(image);
        console.log('photo taken')
        async function run() {
          if (image) {
            const default_question = 'What\'s in this image?'
            const question = default_question;
            // const res = await fetch(image);
            // const blob = await res.blob();
            // const file = new File([blob], 'image.jpeg', { type: 'image/jpeg' })
            const data = new FormData();
            data.append('image', image);
            // console.log(data.entries())
            // return
            const response = await fetch(`/api/image?question=${encodeURIComponent(question)}`, {
              method: 'POST',
              body: data
            })
            console.log(await response.text())
          }
        }
        run();
    }, [image])

    return (
        
        <div>
            <div className='fixed top-0 left-0 h-full w-full'
                 onTouchStart={
                () => {
                    // works!
                    console.log("touched");
                    // @ts-expect-error
                    setImage(camera.current ? camera.current.takePhoto() : null)
                }}
                 onTouchEnd={
                     // works!
                     () => {

                         console.log("released");
                     }
                  }
                onMouseDown={() => {
                  // works!
                  console.log("touched");
                  // @ts-expect-error
                  setImage(camera.current ? camera.current.takePhoto() : null)
              }}

            >
                <Camera ref={camera} facingMode={isMobile ? "environment" : "user"} errorMessages={{noCameraAccessible:"No Camera Accessible", permissionDenied:"Permission Denied"}}/>
            </div>

        </div>

    );
}
