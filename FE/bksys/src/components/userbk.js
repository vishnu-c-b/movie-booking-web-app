import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Card, Container, Row, Col, Spinner, Button } from "react-bootstrap";
import { PDFDownloadLink, Page, Text, View, Image, StyleSheet, Document } from "@react-pdf/renderer";
import QRCode from "qrcode";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  qrCode: {
    marginTop: 10,
    marginBottom: 10
  }
});

const UserBookings = () => {
  const user = useSelector((store) => store.auth.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/user_bookings", {
          headers: {
            Authorization: `Token ${user.token}`,
          },
        });

        const bookingsWithQr = await Promise.all(response.data.map(async (booking) => {
          const qrCodeData = generateQRCodeData(booking);
          const qrCodeDataURL = await generateQRCodeDataURL(qrCodeData);
          return { ...booking, qrCodeDataURL };
        }));

        setBookings(bookingsWithQr);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user.token]);

  // Function to generate QR code data
  const generateQRCodeData = (booking) => {
    return `Booking ID: ${booking.booking_id}\nMovie: ${booking.movie}\nShow Date: ${booking.show_date}\nShow Time: ${booking.show_time}\nSeats Booked: ${Array.isArray(booking.seats_booked) ? booking.seats_booked.join(", ") : booking.seats_booked}\nTotal Price: ₹${booking.total_price}`;
  };

  // Function to generate QR code as data URL
  const generateQRCodeDataURL = async (data) => {
    try {
      return await QRCode.toDataURL(data);
    } catch (err) {
      console.error("Error generating QR code:", err);
      return "";
    }
  };

  const renderPDFDocument = (booking) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Booking Details:</Text>
          <Text>Booking ID: {booking.booking_id}</Text>
          <Text>Movie: {booking.movie}</Text>
          <Text>Show Date: {booking.show_date}</Text>
          <Text>Show Time: {booking.show_time}</Text>
          <Text>Seats Booked: {Array.isArray(booking.seats_booked) ? booking.seats_booked.join(", ") : booking.seats_booked}</Text>
          <Text>Total Price: ₹{booking.total_price}</Text>
          <Text style={styles.qrCode}>QR Code:</Text>
          <Image src={booking.qrCodeDataURL} />
        </View>
      </Page>
    </Document>
  );

  return (
    <Container className="mt-5">
      <h1 className="mb-4" style={{ color: "#ff4d4d" }}>
        Your Bookings
      </h1>
      {loading ? (
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      ) : bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <Row>
          {bookings.map((booking) => (
            <Col md={4} key={booking.booking_id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{booking.movie}</Card.Title>
                  <Card.Text>
                    <strong>Show Date:</strong> {booking.show_date}
                  </Card.Text>
                  <Card.Text>
                    <strong>Show Time:</strong> {booking.show_time}
                  </Card.Text>
                  <Card.Text>
                    <strong>Seats Booked:</strong>{" "}
                    {Array.isArray(booking.seats_booked)
                      ? booking.seats_booked.join(", ")
                      : booking.seats_booked}
                  </Card.Text>
                  <Card.Text>
                    <strong>Total Price:</strong> ₹{booking.total_price}
                  </Card.Text>
                  <PDFDownloadLink
                    document={renderPDFDocument(booking)}
                    fileName={`Booking_${booking.booking_id}.pdf`}
                  >
                    {({ blob, url, loading, error }) => (
                      <Button variant="primary" disabled={loading}>
                        {loading ? "Generating PDF..." : "Download PDF"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default UserBookings;
