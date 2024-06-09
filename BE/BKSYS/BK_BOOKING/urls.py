from django.urls import path
from . import views
urlpatterns = [


path('reg',views.register,name="reg"),
path('log',views.login,name="log"),
path('out',views.logout,name= "out"),
path('add',views.add,name= "add"),
path('list',views.list,name= "list"),
path('edit/<int:id>/',views.edit,name= "edit"),
path('delete/<int:id>/',views.delete,name= "delete"),

path('book_movie',views.book_movie,name= "book_movie"),
path('user_bookings',views.user_bookings,name= "user_bookings"),

path('verify_payment',views.verify_payment,name= "verify_payment"),



]