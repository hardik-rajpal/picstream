import requests
a = requests.get('https://picsum.photos/200/300')
print(a.content)