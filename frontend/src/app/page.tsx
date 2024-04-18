'use client';

import 'regenerator-runtime/runtime';
import { useState, useRef } from "react";
import { useEffect } from "react";
import {Camera} from "react-camera-pro";
import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const appId = process.env.NEXT_PUBLIC_SPEECHLY_APP_ID as string;
const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(appId);
SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);


export default function Page() {
    const camera = useRef(null);
    const [image, setImage] = useState<string | null>(null);

    const [width, setWidth] = useState<number>(1920);
    const {
        transcript,
        listening,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();


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
            const default_question = 'What\'s in front of me?'
            const question = transcript.length > 0 ? transcript : default_question;
            console.log("question", question);
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

    const handleListen = () => {
        console.log("touched");
        SpeechRecognition.startListening({ continuous: true });
    }
    const handleStop = () => {
        console.log("released");
        SpeechRecognition.stopListening();
        // @ts-expect-error
        setImage(camera.current ? camera.current.takePhoto() : null)
        console.log(transcript);
    }

    return (
        
        <div>
            <div className='fixed top-0 left-0 h-full w-full'
                 onTouchStart={handleListen}
                 onTouchEnd={handleStop}
                 onMouseDown={handleListen}
                onMouseUp={handleStop}

            >
                <Camera ref={camera} facingMode={isMobile ? "environment" : "user"} errorMessages={{noCameraAccessible:"No Camera Accessible", permissionDenied:"Permission Denied"}}/>
            </div>
            <div className='fixed bottom-0 left-0 w-full bg-black text-white'>
                <div className='flex justify-between'>
                    <div className='p-2'>
                        {transcript}
                    </div>
                    <div className='p-2'>
                        {listening ? 'Listening' : 'Not Listening'}
                    </div>
                </div>
            </div>
        </div>

    );
}
