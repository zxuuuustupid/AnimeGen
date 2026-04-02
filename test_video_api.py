import requests

url = "https://open.bigmodel.cn/api/paas/v4/videos/generations"

# 读取API key
with open('/Users/jusin0305/project/StoryVision/.env.local', 'r') as f:
    for line in f:
        if line.startswith('ZHIPU_API_KEY='):
            api_key = line.split('=')[1].strip()
            break

payload = {
    "model": "cogvideox-flash",
    "prompt": "A cat is playing with a ball.",
    "quality": "speed",
    "with_audio": False,
    "size": "1280x720",
    "fps": 30
}
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print("Status Code:", response.status_code)
print("Response:", response.text)
