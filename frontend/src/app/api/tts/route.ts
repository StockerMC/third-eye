export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');

    if (!text) throw new Error('text is none')

    const { tts } = require("@/app/util");
    const response = await tts(text);

    const headers = new Headers();
  
    headers.set("Content-Type", "audio/*");

    // return Response.json({ 
    //     response: response
    // },)

    return new Response(
        response,
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST',
                'Content-Type': 'audio/*',
            }
        }
    );
}