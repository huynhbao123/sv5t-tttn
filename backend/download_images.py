import requests
import os

def download_file(url, path):
    try:
        response = requests.get(url, stream=True, timeout=10)
        if response.status_code == 200:
            with open(path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Downloaded: {path}")
        else:
            print(f"Failed: {url} (Status: {response.status_code})")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

# Base media path
base_path = "d:/HK2NAM4/DoAnTN/SV5T_TTTN/backend/media"
os.makedirs(f"{base_path}/vinh_danh", exist_ok=True)
os.makedirs(f"{base_path}/bai_viet", exist_ok=True)

# Images to download
images = [
    ("https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=400", f"{base_path}/vinh_danh/student_3.jpg"),
    ("https://images.pexels.com/photos/6763617/pexels-photo-6763617.jpeg?auto=compress&cs=tinysrgb&w=800", f"{base_path}/bai_viet/news_1.jpg"),
    ("https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=800", f"{base_path}/bai_viet/news_2.jpg"),
    ("https://images.pexels.com/photos/5673488/pexels-photo-5673488.jpeg?auto=compress&cs=tinysrgb&w=800", f"{base_path}/bai_viet/news_3.jpg")
]

for url, path in images:
    download_file(url, path)
