
import base64
import waitress
import requests
import os

from dotenv import load_dotenv
from flask import Flask, request

from flask_cors import CORS, cross_origin

load_dotenv()

OPENAI_API_KEY = os.environ['OPENAI_API_KEY']

app = Flask(__name__)
CORS(app, support_credentials=True)

@app.route("/", methods=['GET'])
@cross_origin('*')
def test():
    return '<p>hi</p>'

@app.route("/image", methods=['GET'])
@cross_origin('*')
def hello_world():

    # Getting the base64 string
    # base64_image = encode_image(image_path)
    base64_image = request.args.get('data')

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
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
    data = response.json()
    return data['choices'][0]['message']['content']

# waitress.serve(app, listen='0.0.0.0:5003')
