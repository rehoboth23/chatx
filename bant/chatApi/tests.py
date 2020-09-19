import requests
from django.test import TestCase

# Create your tests here.

response = requests.post(f"https://www.rehoboth.link/login/",
                                         data={'username': "mari@mail.com", 'password': "123okorie"})
print(response.content)
