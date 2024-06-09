import React, { useState, useEffect } from "react";
import axios from "axios";
import checkAuth from "./auth/checkAuth";
import { Button, Modal, Form } from "react-bootstrap";
import { useSelector } from "react-redux";

const HomePageComponent = () => {
  const user = useSelector((store) => store.auth.user);
  const [movies, setMovies] = useState([]);
  const [show, setShow] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    movieId: null,
    quantity: 1,
    showTime: "",
    showDate: "",
  });
  const [availableShowTimes, setAvailableShowTimes] = useState([]);

  useEffect(() => {
    // Fetch the list of movies from the API
    axios
      .get("http://127.0.0.1:8000/list", {
        headers: {
          Authorization: `Token ${user.token}`,
        },
      })
      .then((response) => {
        // Filter movies with availability set to true
        const availableMovies = response.data.filter(movie => movie.availability);
        setMovies(availableMovies);
      })
      .catch((error) => console.error("Error fetching movies:", error));
  }, [user.token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({
      ...bookingDetails,
      [name]: value,
    });
  };

  const handleBookMovie = () => {
    const bookingData = {
      movie_id: bookingDetails.movieId,
      quantity: bookingDetails.quantity,
      show_time: bookingDetails.showTime,
      show_date: bookingDetails.showDate,
    };

    axios
      .post("http://127.0.0.1:8000/book_movie", bookingData, {
        headers: {
          Authorization: `Token ${user.token}`,
        },
      })
      .then((response) => {
        const { order_id, amount, currency } = response.data;
        handleRazorpayPayment(order_id, amount, currency);
      })
      .catch((error) => {
        console.error("Error initiating booking:", error);
      });
  };

  const handleRazorpayPayment = (order_id, amount, currency) => {
  const options = {
    key: "rzp_test_WywoaZPJVI7Dfo", // Replace with your Razorpay key ID
    amount: amount.toString(),
    currency: currency,
    name: "Your Movie Booking App",
    description: "Movie Ticket Booking",
    order_id: order_id,
    handler: (response) => {
      axios
        .post(
          "http://127.0.0.1:8000/verify_payment",
          {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            movie_id: bookingDetails.movieId,
            quantity: bookingDetails.quantity,
            show_time: bookingDetails.showTime,
            show_date: bookingDetails.showDate,
          },
          {
            headers: {
              Authorization: `Token ${user.token}`,
            },
          }
        )
        .then((response) => {
          console.log("Payment and booking successful:", response.data);
          setShow(false);
          setBookingDetails({
            movieId: null,
            quantity: 1,
            showTime: "",
            showDate: "",
          });
        })
        .catch((error) => {
          console.error("Error verifying payment:", error);
        });
    },
    prefill: {
      name: user.username,
      email: user.email,
      contact: "Your User Contact",
    },
    notes: {
      address: "Your User Address",
    },
    theme: {
      color: "#3399cc",
    },
  };

  const rzp1 = new window.Razorpay(options);
  rzp1.open();
};


  const handleShow = (movie) => {
    setBookingDetails({ ...bookingDetails, movieId: movie.id });
    setAvailableShowTimes(movie.show_timings.split(","));
    setShow(true);
  };

  const handleClose = () => setShow(false);

  return (
    <div className="container mt-5">
      <h1 className="mb-4" style={{ color: "#ff4d4d" }}>Available Movies</h1>
      <div className="row">
        {movies.map((movie) => (
          <div className="col-md-4 mb-4" key={movie.id}>
            <div className="card">
              <img src={movie.poster} className="card-img-top" alt={movie.title} />
              <div className="card-body">
                <h5 className="card-title">{movie.title}</h5>
                <p className="card-text">{movie.description}</p>
                <Button variant="primary" onClick={() => handleShow(movie)}>
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={bookingDetails.quantity}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Show Time</Form.Label>
              <Form.Control
                as="select"
                name="showTime"
                value={bookingDetails.showTime}
                onChange={handleInputChange}
              >
                <option value="">Select a show time</option>
                {availableShowTimes.map((time, index) => (
                  <option key={index} value={time.trim()}>{time.trim()}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Show Date</Form.Label>
              <Form.Control
                type="date"
                name="showDate"
                value={bookingDetails.showDate}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleBookMovie}>
            Book
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default checkAuth(HomePageComponent);
