'use client';

import 'regenerator-runtime/runtime';
import { useState, useRef, useEffect } from "react";
import {Camera} from "react-camera-pro";
import useWhisper from "@chengsokdara/use-whisper";

export default function Page() {

    const camera = useRef(null);
    const [image, setImage] = useState<string | null>(null);
    // const [numberOfCameras, setNumberOfCameras] = useState(0);

    const setNumberOfCameras = (n: number) => {
        if (n == 2) {
            // @ts-ignore
            camera.current.switchCamera();
        } else {
            // @ts-ignore
            camera.current.switchCamera();
        }
    }

    const {
        recording,
        speaking,
        transcribing,
        transcript,
        pauseRecording,
        startRecording,
        stopRecording,
      } = useWhisper({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // YOUR_OPEN_AI_TOKEN
      })

    const [width, setWidth] = useState(1920);

    useEffect(() => {
        setWidth(window.innerWidth);
        // if (window.innerWidth < 720) {
        //     // @ts-ignore
        //     camera.current.switchCamera('environment');
        // } else {
        //     // @ts-ignore
        //     camera.current.switchCamera('user');
        // }
    }, [setWidth])

    const [changed, setChanged] = useState(false)

    const videoReadyCallback = () => {
        if (changed) return;
        if (window.innerWidth < 720) {
            // @ts-ignore
            camera.current.switchCamera('environment');
        } else {
            // @ts-ignore
            camera.current.switchCamera('user');
        }
        setChanged(true);
    }

    const handleListen = () => {
        console.log("touched");
        startRecording();
        // resetTranscript();
        // SpeechRecognition.startListening({
        //     continuous: true,
        //     language: 'en-US'
        // });
    }
    const handleStop = () => {
        console.log("released");
        // SpeechRecognition.abortListening();
        // // @ts-expect-error
        // setImage(camera.current ? camera.current.takePhoto() : null)
        // console.log(transcript);
        stopRecording();

        async function run() {
            // if (!image) return;
            if (!camera.current) return;
            // @ts-ignore
            const image = camera.current.takePhoto();
            const default_question = 'What\'s in front of me?'
            const question = transcript.text || default_question;
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
            const text = await response.text();
            console.log(text)

            const blobResponse = await fetch(`/api/tts?text=${encodeURIComponent(text)}`, {
                method: 'POST',
            })
            const blob = await blobResponse.blob();
            console.log(blob)
            const blobUrl = window.URL.createObjectURL(blob);
            const element = document.createElement('audio')
            console.log(element)
            document.getElementsByClassName('container')[0].appendChild(element);
            element.src = blobUrl;
            element.play()
            element.onended = () => window.URL.revokeObjectURL(blobUrl);
            // return element;
            // todo window.URL.revokeObjectURL(url);
        }
        run();
      }

    return (

        <div className='container'>
            <div className='fixed top-0 left-0 h-full w-full'
                 onTouchStart={handleListen}
                onTouchEnd={handleStop}
                onMouseDown={handleListen}
                onMouseUp={handleStop}

            >
                <Camera ref={camera} numberOfCamerasCallback={setNumberOfCameras} facingMode='user' errorMessages={{noCameraAccessible:"No Camera Accessible", permissionDenied:"Permission Denied"}}/>
            </div>
            <div className='fixed bottom-0 left-0 w-full bg-black text-white'>
                <div className='flex justify-between'>
                    <div className='p-2'>
                        {transcript.text}
                    </div>
                    <div className='p-2'>
                        {recording ? 'Recording' : 'Not Recording'}
                    </div>
                </div>
            </div>
        </div>

    );
}
