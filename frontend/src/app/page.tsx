'use client';

import 'regenerator-runtime/runtime';
import { useState, useRef, useEffect } from "react";
import {Camera} from "react-camera-pro";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

export default function Page() {

    const camera = useRef(null);

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

    const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    } = useSpeechRecognition({
    clearTranscriptOnListen: true,
    // @ts-ignore
    });

    const startRecording = () => SpeechRecognition.startListening({continuous: true, 
        language: 'en-US'});
    const stopRecording = SpeechRecognition.stopListening;
    const recording = listening;

    const handleListen = () => {
        // setAudio(soundEffect)
        console.log("touched");
        resetTranscript();
        document.getElementsByTagName('video')[0].style.filter = 'brightness(60%)'
        if (audio) {
            audio.pause()
            audio.volume = 0;
            audio.src = '';
            audio.srcObject = null;
            window.URL.revokeObjectURL(audio.src);
            try {
                document.getElementsByClassName('container')[0].removeChild(audio)
            } catch(e) {
                
            }
            setAudio(null);
        }
        Array.from(document.getElementsByTagName('audio')).map(e => e.volume = 0)
        startRecording();
    }
    const [cooking, setCooking] = useState(false);
    const handleStop = () => {
        setCooking(true);
        const soundEffect = new Audio('ding.mp3');
        soundEffect.autoplay = true;
        console.log("released");
        stopRecording();

        async function run() {
            if (!camera.current) return;
            // @ts-ignore
            const image = camera.current.takePhoto();
            setTimeout(() => {
                console.log('waiting 1s')
            }, 1000);
            document.getElementsByTagName('video')[0].style.filter = 'none'
            const default_question = 'What\'s in front of me?'
            console.log(transcript)
            const question = transcript || default_question;
            resetTranscript();
            console.log("question", question);
            const data = new FormData();
            data.append('image', image);
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
            const soundEffect = new Audio();
            setCooking(false);
            soundEffect.autoplay = true;
            setAudio(soundEffect)
            resetTranscript();

            // onClick of first interaction on page before I need the sounds
            // (This is a tiny MP3 file that is silent and extremely short - retrieved from https://bigsoundbank.com and then modified)
            soundEffect.src = blobUrl;

            
            soundEffect.onended = () => window.URL.revokeObjectURL(blobUrl);
        }
        run();
      }

    return (

        <div className='container w-full h-full select-none transition-all p-8'>
            <div className={'w-screen h-screen flex text-center justify-center items-center z-[999] ' + (cooking ? 'block' : 'hidden')}>
                <img className='w-[20vw] h-auto z-50' src="https://i.stack.imgur.com/kOnzy.gif" alt="loading" />
            </div>
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
                        {recording ? 'Listening' : 'Waiting'}
                    </div>
                </div>
            </div>
        </div>

    );
}
