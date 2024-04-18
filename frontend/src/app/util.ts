import OpenAI from "openai";

const openai = new OpenAI();

export async function image_analysis(base64_data_url: string, question: string ) {
    const default_question = 'What\'s in this image?'

    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        // max_tokens: 200,
        messages: [
            {
                "role": "system",
                // "content": "You are a friendly and concise assistant that helps blind people with daily life. The image as your first-person POV. Without mentioning the image, answer questions from your user based on what you see in 1 to 2 sentences. Refer to positions and directions to help the blind user's spatial sense."
                "content": "You are a helpful guide for a blind user wearing glasses that captured this view. In 1 to 2 sentences, describe to the user what you see, answering their question. Use spatial language to help the user"
            },
            {
                role: "user",
                content: [
                { type: "text", text: question },
                {
                    type: "image_url",
                    image_url: {
                    "url": base64_data_url,
                    },
                },
                ],
            },
        ],
    });
    return response.choices[0].message.content;
}

export async function tts(text: string) {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "shimmer",
      input: text,
      speed: 1.2
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const blob = new Blob([buffer], { type: "audio/mp3" });
    return blob;
    // const url = window.URL.createObjectURL(blob);
    // return url;
    // const element = document.createElement('audio')
    // element.src = url;
    // return element;
    
    // if (stream) {
    //     const ctx = new AudioContext();
    //     const audio = new Audio();
    //     const mediaSource = new MediaSource()
    //     const sourceBuffer = mediaSource.addSourceBuffer('audio/mp3')
    //     audio.src = URL.createObjectURL(mediaSource)
    //     audio.play()
    //     let reader = stream.getReader()
    //     let pump = () => {
    //         reader.read().then(({value, done}) => {
    //             // value // chunk of data (push chunk to audio context)
    //             sourceBuffer.appendBuffer(value) // Repeat this for each chunk as ArrayBuffer
    //             if(!done) pump()
    //         })
    //     }
    //     pump()
    // }
    // return stream;
}