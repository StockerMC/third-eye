import { image_analysis } from "../../util";

// function _arrayBufferToBase64( buffer: ArrayBuffer ) {
//     var binary = '';
//     var bytes = new Uint8Array( buffer );
//     var len = bytes.byteLength;
//     for (var i = 0; i < len; i++) {
//         binary += String.fromCharCode( bytes[ i ] );
//     }
//     return window.btoa( binary );
// }

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const question = searchParams.get('question') || "What's in this image?";
    const data = await request.formData();

    const image = data.get('image') as string;
    // const buffer = await file.arrayBuffer();
    // const base64 = Buffer.from(buffer).toString('base64url');
    const response = await image_analysis(image, question);

    // return Response.json({ 
    //     response: response
    // },)

    return new Response(
        response,
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST',
            }
        }
    );
}