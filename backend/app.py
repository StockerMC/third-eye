import waitress
import grequests
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
    question = request.args.get('question')

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    default = 'What\'s in this image?'

    payload = {
        "model": "gpt-4-turbo",
        "messages": [
            {
                "role": "system",
                "content": "You are a friendly and concise assistant that helps blind people with daily life. Answer questions from your user quickly and concisely."
            },
            {
            "role": "user",
            "content": [
                {
                "type": "text",
                "text": f"{question or default}"
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

    response = grequests.map([grequests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)])[0]
    data = response.json()
    return data['choices'][0]['message']['content']

waitress.serve(app, listen='0.0.0.0:5003')
