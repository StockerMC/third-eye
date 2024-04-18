import { image_analysis } from "../../util";

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const question = searchParams.get('question') || "What's in this image?";
    const data = await request.formData();

    const image = data.get('image') as string;
    const response = await image_analysis(image, question);

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