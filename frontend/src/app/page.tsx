'use client';

import 'regenerator-runtime/runtime';
import { useState, useRef, useEffect } from "react";
import {Camera} from "react-camera-pro";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

export default function Page() {

    const camera = useRef(null);
    const [image, setImage] = useState<string | null>(null);

    const [isMobile, setIsMobile] = useState(false)
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    useEffect(() => {
        var UA = navigator.userAgent;
        const hasTouchScreen = (
            /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
            /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
        ); 
        console.log(UA)
        setIsMobile(hasTouchScreen);
    }, [])

    // const [numberOfCameras, setNumberOfCameras] = useState(0);

    const setNumberOfCameras = (n: number) => {
        if (n == 2 || window.innerWidth < 700) {
            // @ts-ignore
            // camera.current.switchCamera();
            setIsMobile(true);
        } else {
            // @ts-ignore
            // camera.current.switchCamera();
        }
    }

    const [changed, setChanged] = useState(false)
    // const [changed, setChanged] = useState(false);
    useEffect(() => {
        if (changed) return;
        console.log(window.innerWidth);
        if (window.innerWidth < 700) {
            setIsMobile(true);
            setTimeout(() => {
                // @ts-ignore
                camera.current.switchCamera();
            }, 1000);
        }
        setChanged(true);
    }, [setIsMobile, changed]);

    // const {
    //     recording,
    //     speaking,
    //     transcribing,
    //     transcript,
    //     pauseRecording,
    //     startRecording,
    //     stopRecording,
    //   } = useWhisper({
    //     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // YOUR_OPEN_AI_TOKEN,
    //     autoTranscribe: true,
    //     streaming: true,
    //     timeSlice: 1000
    //   })
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const startRecording = SpeechRecognition.startListening;
  const stopRecording = SpeechRecognition.stopListening
  const recording = listening;

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
        resetTranscript();
        // if (recording) return;
        document.getElementsByTagName('video')[0].style.filter = 'brightness(60%)'
        if (audio) {
            audio.pause()
            audio.volume = 0;
            audio.src = '';
            audio.srcObject = null;
            window.URL.revokeObjectURL(audio.src);
            document.getElementsByClassName('container')[0].removeChild(audio)
            setAudio(null);
        }
        Array.from(document.getElementsByTagName('audio')).map(e => e.volume = 0)
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
            setTimeout(() => {
                console.log('waiting 1s')
            }, 1000);
            document.getElementsByTagName('video')[0].style.filter = 'none'
            // @ts-ignore
            const image = camera.current.takePhoto();
            const default_question = 'What\'s in front of me?'
            console.log(transcript)
            const question = transcript || default_question;
            resetTranscript();
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
            console.log(text);

            const blobResponse = await fetch(`/api/tts?text=${encodeURIComponent(text)}`, {
                method: 'POST',
            })
            const blob = await blobResponse.blob();
            console.log(blob)
            const blobUrl = window.URL.createObjectURL(blob);
            // const element = document.createElement('audio')
            // console.log(element)
            // document.getElementsByClassName('container')[0].appendChild(element);
            // element.src = blobUrl;
            // element.load();
            // setAudio(element);
            // element.play();
            const soundEffect = new Audio();
            soundEffect.autoplay = true;
            setAudio(soundEffect)

            // onClick of first interaction on page before I need the sounds
            // (This is a tiny MP3 file that is silent and extremely short - retrieved from https://bigsoundbank.com and then modified)
            soundEffect.src = blobUrl;


            soundEffect.onended = () => window.URL.revokeObjectURL(blobUrl);
            // return element;
            // todo window.URL.revokeObjectURL(url);
        }
        run();
      }

    return (

        <div className='container select-none transition-all p-8'>
            <div className='fixed top-0 left-0 h-full w-full'
                 onTouchStart={handleListen}
                onTouchEnd={handleStop}
                onMouseDown={handleListen}
                onMouseUp={handleStop}

            >
                <Camera ref={camera} numberOfCamerasCallback={setNumberOfCameras} videoReadyCallback={() => {
                    if (changed) return;
                    if (isMobile) {
                        // @ts-ignore
                        camera.current.switchCamera();
                    }
                    setChanged(true);
                }} facingMode={isMobile ? 'environment': 'user'} errorMessages={{noCameraAccessible:"No Camera Accessible", permissionDenied:"Permission Denied"}}/>
            </div>
            <div className='fixed bottom-0 left-0 w-full bg-black text-white mb-4'>
                <div className='flex justify-between select-none'>
                    <div className='p-2 select-none'>
                        {transcript}
                    </div>
                    <div className='p-2 select-none'>
                        {recording ? 'Recording' : 'Not Recording'}
                    </div>
                </div>
            </div>
        </div>

    );
}
