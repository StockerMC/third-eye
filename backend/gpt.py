import base64
import requests
from keys import OPENAI_API_KEY

from blacksheep import FromFiles, post



# OpenAI API Key
api_key = OPENAI_API_KEY
@post("/")
async def post_data(files: FromFiles):
    data = files.value
    image = data[0].data

    # Getting the base64 string
    base64_image = base64.b64encode(image)

    headers = {
      "Content-Type": "application/json",
      "Authorization": f"Bearer {api_key}"
    }

    payload = {
      "model": "gpt-4-turbo",
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": "What's in this image?"
            },
            {
              "type": "image_url",
              "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}",
                "detail": "low"
              }
            }
          ]
        }
      ],
      "max_tokens": 200
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    return response.json()




# Function to encode the image
def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')
