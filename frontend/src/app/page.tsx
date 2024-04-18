'use client';

import 'regenerator-runtime/runtime';
import { useState, useRef } from "react";
import { useEffect } from "react";
import {Camera} from "react-camera-pro";

// import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// const appId = process.env.NEXT_PUBLIC_SPEECHLY_APP_ID as string;
// const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(appId);
// SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);

// export function tts(text: string) {
//     const synth = window.speechSynthesis;
//     if (synth.speaking) {
//         synth.cancel();
//         return;
//     }
//     const utterance = new SpeechSynthesisUtterance(text);
//     let voices = window.speechSynthesis.getVoices();
//     if (voices.length == 0) {
//         window.speechSynthesis.onvoiceschanged = () => {
//             voices = window.speechSynthesis.getVoices();
//             let voice;
//             voices.forEach((v, i) => {
//                 if (v.lang == 'en-CA') {
//                     voice = v;
//                     return;
//                 }
//             });
//             if (!voice) {
//                 throw new Error('voice undefined')
//             }
//             utterance.voice = voice;
//         };
//     } else {
//         let voice;
//         voices.forEach((v, i) => {
//             if (v.lang == 'en-CA') {
//                 voice = v;
//                 return;
//             }
//         });
//         if (!voice) {
//             throw new Error('voice undefined')
//         }
//         utterance.voice = voice;
//     }


//     // utterance.voice = voice;
//     // const rate = document.getElementById('rate') as any | undefined;
//     // if (rate) utterance.rate = rate.value;
//     synth.speak(utterance)
// }

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
            const default_question = 'What\'s in front of me?'
            const question = default_question;
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
        }
        run();
    }, [image])

    // const handleListen = () => {
    //     console.log("touched");
    //     SpeechRecognition.startListening({ continuous: true });
    // }
    // const handleStop = () => {
    //     console.log("released");
    //     SpeechRecognition.stopListening();
    //     // @ts-expect-error
    //     setImage(camera.current ? camera.current.takePhoto() : null)
    //     console.log(transcript);
    // }

    return (
        
        <div className='container'>
            <div className='fixed top-0 left-0 h-full w-full'
                //  onTouchStart={handleListen}
                onMouseDown={() => 
                    // @ts-expect-error
                    setImage(camera.current ? camera.current.takePhoto() : null)
                }
                //  onTouchEnd={handleStop}
                //  onMouseDown={handleListen}
                // onMouseUp={handleStop}

            >
                <Camera ref={camera} facingMode={isMobile ? "environment" : "user"} errorMessages={{noCameraAccessible:"No Camera Accessible", permissionDenied:"Permission Denied"}}/>
            </div>
            {/* <div className='fixed bottom-0 left-0 w-full bg-black text-white'>
                <div className='flex justify-between'>
                    <div className='p-2'>
                        {transcript}
                    </div>
                    <div className='p-2'>
                        {listening ? 'Listening' : 'Not Listening'}
                    </div>
                </div>
            </div> */}
        </div>

    );
}
