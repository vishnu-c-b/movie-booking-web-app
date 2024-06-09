from django.shortcuts import redirect, render
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from rest_framework import status

from .forms import LoginForm
from django.contrib.auth.models import auth
from django.contrib.auth import authenticate
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .serializers import MovieSerializer,BookingSerializer
import uuid
import random
import string
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import HttpResponse
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND,HTTP_405_METHOD_NOT_ALLOWED
from rest_framework.authtoken.models import Token
from .models import Movie,Booking
from .forms import MovieForm
# Create your views here.
import razorpay
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from .models import Movie, Booking
from .serializers import BookingSerializer


from django.core.mail import send_mail
from django.contrib.auth.forms import UserCreationForm
from django import forms




class ExtendedUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta(UserCreationForm.Meta):
        fields = UserCreationForm.Meta.fields + ('email',)











@csrf_exempt
@api_view(['POST'])
@permission_classes((AllowAny,))    
def register(request):

    form = ExtendedUserCreationForm(request.data)

    if request.method == "POST":

        form = ExtendedUserCreationForm(data=request.data)

        if form.is_valid():

            user=form.save()

            return Response("account created successfully", status=status.HTTP_201_CREATED)
    return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes((AllowAny,))
def login(request):
    if request.method == "POST":
        username = request.data.get('username')
        password = request.data.get('password')

        if not (username and password):
            return Response({'error': 'Please provide both username and password'}, status=HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)

        if not user:
            return Response({'error': 'Invalid Credentials'}, status=HTTP_404_NOT_FOUND)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=HTTP_200_OK)

    # If request method is not POST
    return Response({'error': 'Method Not Allowed'}, status=HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    print("Token received:", request.headers.get('Authorization'))  
    auth.logout(request)

    messages.success(request, "Logout success!")
    return Response("Logout success!", status=status.HTTP_201_CREATED)
    



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add(request):
    if request.method == 'POST':
        form = MovieForm(request.POST)
        if form.is_valid():
            new_movie = form.save()
            return JsonResponse({'message': 'Movie added successfully', 'id': new_movie.id})
        else:
            return JsonResponse({'errors': form.errors}, status=400)
    else:
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list(request):
    if request.method == 'GET':
        movies = Movie.objects.all()
        serializer = MovieSerializer(movies, many=True)
        return JsonResponse(serializer.data, safe=False)
    else:
        return JsonResponse({'error': 'Only GET requests are allowed'}, status=405)
    
 

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit(request, id):
    movie = get_object_or_404(Movie, pk=id)
    serializer = MovieSerializer(movie, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete(request, id):
    try:
        movie = get_object_or_404(Movie, pk=id)
        movie.delete()
        return JsonResponse({'message': 'Movie deleted successfully'})
    except:
        return JsonResponse({'error': 'Failed to delete movie'}, status=500)
    
def generate_booking_id():
    # Generate a unique booking ID using UUID
    return str(uuid.uuid4().hex)[:8]



def generate_seat_numbers(quantity):
    # Generate a random starting number between 1 and 100
    start_number = random.randint(1, 100)
    
    # Generate consecutive seat numbers starting from the random start number
    seat_numbers = [str(start_number + i) for i in range(quantity)]
    
    return ','.join(seat_numbers)







# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def book_movie(request):
#     if request.method == 'POST':
#         try:
#             movie_id = request.data.get('movie_id')
#             quantity = int(request.data.get('quantity', 1))
#             show_time = request.data.get('show_time')
#             show_date = request.data.get('show_date')
            
#             movie = Movie.objects.get(pk=movie_id)
#             total_price = movie.ticket_rates * quantity
            
#             booking_id = generate_booking_id()
#             seats_booked = generate_seat_numbers(quantity)
            
#             booking = Booking.objects.create(
#                 booking_id=booking_id,
#                 user=request.user,
#                 movie=movie,
#                 quantity=quantity,
#                 seats_booked=seats_booked,
#                 show_time=show_time,
#                 show_date=show_date,
#                 total_price=total_price
#             )
            
#             serializer = BookingSerializer(booking)
            
#             return JsonResponse(serializer.data, status=201)
        
#         except Movie.DoesNotExist:
#             return JsonResponse({'error': 'Movie not found'}, status=404)
        
#         except Exception as e:
#             return JsonResponse({'error': str(e)}, status=400)
        


# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@api_view(['POST'])
@permission_classes([AllowAny])
def book_movie(request):
    if request.method == 'POST':
        try:
            movie_id = request.data.get('movie_id')
            quantity = int(request.data.get('quantity', 1))
            show_time = request.data.get('show_time')
            show_date = request.data.get('show_date')
            
            movie = Movie.objects.get(pk=movie_id)
            total_price = movie.ticket_rates * quantity
            
            # Create a Razorpay order
            order_amount = int(total_price * 100)  # Convert to paise
            order_currency = 'INR'
            order_receipt = generate_booking_id()
            notes = {'user_id': request.user.id, 'movie_id': movie_id, 'show_time': show_time, 'show_date': show_date}

            razorpay_order = razorpay_client.order.create(dict(
                amount=order_amount,
                currency=order_currency,
                receipt=order_receipt,
                notes=notes,
                payment_capture='0'
            ))

            order_id = razorpay_order['id']

            return JsonResponse({'order_id': order_id, 'amount': order_amount, 'currency': order_currency, 'movie_id': movie_id}, status=201)

        except Movie.DoesNotExist:
            return JsonResponse({'error': 'Movie not found'}, status=404)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@api_view(['POST'])
@permission_classes((AllowAny,))
def verify_payment(request):
    try:
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }

        result = razorpay_client.utility.verify_payment_signature(params_dict)
        if result:
            movie_id = request.data.get('movie_id')
            quantity = int(request.data.get('quantity', 1))
            show_time = request.data.get('show_time')
            show_date = request.data.get('show_date')
            
            movie = Movie.objects.get(pk=movie_id)
            total_price = movie.ticket_rates * quantity
            
            booking_id = generate_booking_id()
            seats_booked = generate_seat_numbers(quantity)
            
            booking = Booking.objects.create(
                booking_id=booking_id,
                user=request.user,
                movie=movie,
                quantity=quantity,
                seats_booked=seats_booked,
                show_time=show_time,
                show_date=show_date,
                total_price=total_price
            )
            
            # Send confirmation email to user
            subject = 'Booking Confirmation'
            message = f"""
                Dear {request.user.username},

                Your booking is confirmed!
                Movie: {movie.title}
                Quantity: {quantity}
                Show Time: {show_time}
                Show Date: {show_date}
                Seats: {seats_booked}
                Total Price: {total_price}

                
                Thank you for booking with us!
            """
            from_email = settings.EMAIL_HOST_USER
            recipient_list = [request.user.email]

            s=send_mail(subject, message, from_email, recipient_list)

            serializer = BookingSerializer(booking)
            
            return JsonResponse(serializer.data, status=201)
        else:
            return JsonResponse({'error': 'Invalid payment signature'}, status=400)
    
    except razorpay.errors.SignatureVerificationError as e:
        return JsonResponse({'error': 'Razorpay signature verification failed'}, status=400)
    except Movie.DoesNotExist:
        return JsonResponse({'error': 'Movie not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)






@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_bookings(request):
    if request.method == 'GET':
        # Retrieve bookings for the logged-in user with movie details
        bookings = Booking.objects.filter(user=request.user).select_related('movie')
        
        # Serialize the bookings with movie details
        serializer = BookingSerializer(bookings, many=True)
        
        return JsonResponse(serializer.data, status=200, safe=False)
