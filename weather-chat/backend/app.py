from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Retriecve API keys from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
openai.api_key = OPENAI_API_KEY

def get_location_from_ip(ip):
    # Get the approximate location from the user IP address
    """ Potential issues/improvemets:
    - IP addrersses behind VPNs or proxies
    - ipapi will limit number of requests
    """
    try:
        # For local testing, return a fixed location
        if ip == "127.0.0.1":
            return {"city": "Waterloo", "region": "Ontario", "country": "Canada"}
        
        url = f"https://ipapi.co/{ip}/json/"
        response = requests.get(url, timeout=5) # in case ipapi is slow
        response.raise_for_status() # raise an error if request failed
        data = response.json()
        return {
            "city": data.get("city"),
            "region": data.get("region"),
            "country": data.get("country_name")
        }
    except Exception as e: # since in early stage, catch all exceptions and log them
        print(f"Error getting location from IP: {e}")
        return {"city": "Unknown", "region": "Unknown", "country": "Unknown"}

def get_weather(location):
    # Grab weather information based on the location"
    """ Potential issues/improvements:
    - If any field in location is missing, API may not know what to return
    - Could potentially cache responses for more frequest queries to reduce API calls
    - It will take some extra time to include country details (will need to convert to short 2 letter form), so if 2 cities have the same name in different countreis that is an issue"""
    try: 
        city = location.get("city")

        if not city or city == "Unknown":
            return {}
        
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error getting weather information: {e}")
        return {}
    
def build_prompt(user_message, location, weather_info):
    # Build the prompt for OpenAI API
    city = location.get("city", "your area")
    region = location.get("region", "")
    country = location.get("country", "")

    location_str = f"{city}, {region}, {country}" if region and country else city

    if not weather_info or weather_info == {}:
        # No weather data available
        prompt = (
            f"The user asked: '{user_message}'. "
            f"I wasn't able to get current weather information for {location_str}. "
            "Respond in a friendly, conversational way and apologize that you can't provide "
            "current weather data, but offer to help in other ways or suggest they check a weather app."
        )

    else:
        weather_description = weather_info.get("weather", [{}])[0].get("description", "No weather data available")
        temp = weather_info.get("main", {}).get("temp", "N/A")
        prompt = (
            f"The user asked: '{user_message}'. "
            f"The current weather in {location_str} is {weather_description} with a temperature of {temp}°C. "
            "Respond in a friendly, conversational way that incorporates the weather information."
        )
    return prompt
    
def get_openai_response(prompt):
    '''# Get a response from OpenAI API
    """ Potential issues/improvements:
    - If the prompt is too long, it may exceed the token limit """
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Error getting response from OpenAI: {e}")
        return "Sorry, I couldn't process your request at the moment."
        '''
    # Mock response for testing purposes
    print(f"MOCK: Would send this prompt to OpenAI: {prompt[:100]}...")
    return "Hi! I can see your request is working perfectly. The weather system is connected and ready. Once you add OpenAI credits, I'll give you real weather responses!"

@app.route('/chat', methods=['POST'])
def chat():
    """Main endpoint: takes user message, retrieves location and weather info, and returns a response from OpenAI"""
    data = request.json
    user_message = data.get("message")
    user_ip = request.headers.get("X-Forwarded-For", request.remote_addr)

    # Debugging logs
    print(f"User message: {user_message}")
    print(f"User IP: {user_ip}")

    location = get_location_from_ip(user_ip)
    # Debugging logs
    print(f"Location: {location}")

    weather_info = get_weather(location)
    # Debugging logs
    print(f"Weather info: {weather_info}")

    prompt = build_prompt(user_message, location, weather_info)
    # Debugging logs
    print(f"Prompt: {prompt}")

    response_text = get_openai_response(prompt)
    # Debugging logs
    print(f"Response: {response_text}")

    return jsonify({"response": response_text})


if __name__ == "__main__":
    app.run(debug=True)
