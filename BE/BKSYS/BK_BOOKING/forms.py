from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Movie
from django import forms
from django.db import models



from django.contrib.auth.forms import AuthenticationForm
from django.forms.widgets import PasswordInput, TextInput

# - Register/Create a user
class CreateUser(UserCreationForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    def save(self, commit=True):
        user = super(CreateUser, self).save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user
# - Login a user

class LoginForm(AuthenticationForm):

    username = forms.CharField(widget=TextInput())
    password = forms.CharField(widget=PasswordInput())





class MovieForm(forms.ModelForm):
    class Meta:
        model = Movie
        fields = ['title', 'release_date', 'ticket_rates', 'availability', 'description', 'poster', 'show_timings']
