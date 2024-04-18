import OpenAI from "openai";

const openai = new OpenAI();

export async function image_analysis(base64_data_url: string, question: string | null) {
    const default_question = 'What\'s in this image?'

    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        max_tokens: 200,
        messages: [
            {
                "role": "system",
                "content": "You are a friendly and concise assistant that helps blind people with daily life. Answer questions from your user quickly and concisely."
            },
            {
                role: "user",
                content: [
                { type: "text", text: question || default_question },
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