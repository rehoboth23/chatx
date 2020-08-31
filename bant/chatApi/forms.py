from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import ChatUser


class SignUpForm(UserCreationForm, forms.ModelForm):

    name = forms.CharField(widget=forms.TextInput(
        attrs={'class': 'form-control',
               'type': "text",
               'name': "name",
               'placeholder': "Full Name",
               }), label='')

    email = forms.EmailField(widget=forms.EmailInput(
        attrs={'class': 'form-control',
               'type': 'email',
               'name': "email",
               'placeholder': "Email",
               }), label='')

    password1 = forms.CharField(widget=forms.PasswordInput(
        attrs={'class': 'form-control',
               'type': 'password',
               'name': "password1",
               'placeholder': "Password",
               }), label='')
    password2 = forms.CharField(widget=forms.PasswordInput(
        attrs={'class': 'form-control',
               'type': 'password',
               'name': "password2",
               'placeholder': "Re-enter Password",
               }), label='')

    field_order = [
        'name',
        'email',
        'password1',
        'password2'
    ]

    class Meta:
        model = ChatUser
        fields = {
            'name',
            'email',
            'password1',
            'password2',
        }
