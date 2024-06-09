import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { checkAdmin } from "../auth/chechAdmin";



const AdminHomePageComponent = () => {
    const user = useSelector((store) => store.auth.user);
    const [movies, setMovies] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        release_date: "",
        ticket_rates: "",
        availability: true,
        description: "",
        poster: "",
        show_timings: [],
    });
    const [editMovieId, setEditMovieId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const showTimes = ["11:30AM", "2:30PM", "5:00PM", "9:00PM"];

    useEffect(() => {
        // Fetch the list of movies from the API
        axios
            .get("http://127.0.0.1:8000/list", {
                headers: {
                    Authorization: `Token ${user.token}`,
                },
            })
            .then((response) => setMovies(response.data))
            .catch((error) => console.error("Error fetching movies:", error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "show_timings") {
            const updatedShowTimings = formData.show_timings.includes(value)
                ? formData.show_timings.filter((time) => time !== value)
                : [...formData.show_timings, value];
            setFormData({
                ...formData,
                show_timings: updatedShowTimings,
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === "checkbox" ? checked : value,
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formPayload = new FormData();
        for (const [key, value] of Object.entries(formData)) {
            formPayload.append(key, Array.isArray(value) ? value.join(",") : value);
        }

        axios
            .post("http://127.0.0.1:8000/add", formPayload, {
                headers: {
                    Authorization: `Token ${user.token}`,
                },
            })
            .then((response) => {
                console.log("Movie added successfully:", response.data);
                setShowAddModal(false);
                setFormData({
                    title: "",
                    release_date: "",
                    ticket_rates: "",
                    availability: true,
                    description: "",
                    poster: "",
                    show_timings: [],
                });
                // Fetch updated list of movies
                axios
                    .get("http://127.0.0.1:8000/list", {
                        headers: {
                            Authorization: `Token ${user.token}`,
                        },
                    })
                    .then((response) => setMovies(response.data))
                    .catch((error) => console.error("Error fetching movies:", error));
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 401) {
                        console.error("Unauthorized access:", error.response.data);
                        setErrorMessage("Unauthorized access. Please log in.");
                    } else if (error.response.status === 400) {
                        console.error("Bad request:", error.response.data);
                        setErrorMessage(Object.values(error.response.data.errors).join(" "));
                    } else {
                        console.error("Server error:", error.response.data);
                        setErrorMessage("Failed to add movie. Please contact admin.");
                    }
                } else {
                    console.error("Request error:", error.message);
                    setErrorMessage("Failed to add movie. Please try again later.");
                }
            });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();

        const formPayload = new FormData();
        for (const [key, value] of Object.entries(formData)) {
            formPayload.append(key, Array.isArray(value) ? value.join(",") : value);
        }

        axios
            .put(`http://127.0.0.1:8000/edit/${editMovieId}/`, formPayload, {
                headers: {
                    Authorization: `Token ${user.token}`,
                },
            })
            .then((response) => {
                console.log("Movie updated successfully:", response.data);
                setShowEditModal(false);
                setFormData({
                    title: "",
                    release_date: "",
                    ticket_rates: "",
                    availability: true,
                    description: "",
                    poster: "",
                    show_timings: [],
                });
                // Fetch updated list of movies
                axios
                    .get("http://127.0.0.1:8000/list", {
                        headers: {
                            Authorization: `Token ${user.token}`,
                        },
                    })
                    .then((response) => setMovies(response.data))
                    .catch((error) => console.error("Error fetching movies:", error));
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 401) {
                        console.error("Unauthorized access:", error.response.data);
                        setErrorMessage("Unauthorized access. Please log in.");
                    } else if (error.response.status === 400) {
                        console.error("Bad request:", error.response.data);
                        setErrorMessage(Object.values(error.response.data.errors).join(" "));
                    } else {
                        console.error("Server error:", error.response.data);
                        setErrorMessage("Failed to update movie. Please contact admin.");
                    }
                } else {
                    console.error("Request error:", error.message);
                    setErrorMessage("Failed to update movie. Please try again later.");
                }
            });
    };

    const handleDelete = (movieId) => {
        axios
            .delete(`http://127.0.0.1:8000/delete/${movieId}`, {
                headers: {
                    Authorization: `Token ${user.token}`,
                },
            })
            .then((response) => {
                console.log("Movie deleted successfully:", response.data);
                // Fetch updated list of movies
                axios
                    .get("http://127.0.0.1:8000/list", {
                        headers: {
                            Authorization: `Token ${user.token}`,
                        },
                    })
                    .then((response) => setMovies(response.data))
                    .catch((error) => console.error("Error fetching movies:", error));
            })
            .catch((error) => {
                console.error("Error deleting movie:", error.response ? error.response.data : error.message);
            });
    };

    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);
    const handleShowEditModal = (movie) => {
        setFormData({
            title: movie.title,
            release_date: movie.release_date,
            ticket_rates: movie.ticket_rates,
            availability: movie.availability,
            description: movie.description,
            poster: movie.poster,
            show_timings: movie.show_timings.split(","),
        });
        setEditMovieId(movie.id);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => setShowEditModal(false);

    return (
        <div className="container mt-5">
            <h1 className="mb-4" style={{ color: "#ff4d4d" }}>Admin - Manage Movies</h1>
            <Button variant="primary" className="mb-4" onClick={handleShowAddModal}>
                Add New Movie
            </Button>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Release Date</th>
                        <th>Ticket Rates</th>
                        <th>Availability</th>
                        <th>Description</th>
                        <th>Poster</th>
                        <th>Show Timings</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {movies.map((movie) => (
                        <tr key={movie.id}>
                            <td>{movie.title}</td>
                            <td>{movie.release_date}</td>
                            <td>{movie.ticket_rates}</td>
                            <td>{movie.availability ? "Yes" : "No"}</td>
                            <td>{movie.description}</td>
                            <td><img src={movie.poster} alt={movie.title} style={{ width: "100px" }} /></td>
                            <td>{movie.show_timings}</td>
                            <td>
                                <Button variant="warning" onClick={() => handleShowEditModal(movie)} className="mr-2">
                                    Edit
                                </Button>
                                <Button variant="danger" onClick={() => handleDelete(movie.id)}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Add Movie Modal */}
            <Modal show={showAddModal} onHide={handleCloseAddModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Movie</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="release_date">
                            <Form.Label>Release Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="release_date"
                                value={formData.release_date}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="ticket_rates">
                            <Form.Label>Ticket Rates</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                name="ticket_rates"
                                value={formData.ticket_rates}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="availability">
                            <Form.Check
                                type="checkbox"
                                name="availability"
                                label="Available"
                                checked={formData.availability}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="description">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="poster">
                            <Form.Label>Poster URL</Form.Label>
                            <Form.Control
                                type="text"
                                name="poster"
                                value={formData.poster}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="show_timings">
                            <Form.Label>Show Timings</Form.Label>
                            {showTimes.map((time) => (
                                <Form.Check
                                    key={time}
                                    type="checkbox"
                                    name="show_timings"
                                    label={time}
                                    value={time}
                                    checked={formData.show_timings.includes(time)}
                                    onChange={handleInputChange}
                                />
                            ))}
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Add Movie
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseAddModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Movie Modal */}
            <Modal show={showEditModal} onHide={handleCloseEditModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Movie</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group controlId="title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="release_date">
                            <Form.Label>Release Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="release_date"
                                value={formData.release_date}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="ticket_rates">
                            <Form.Label>Ticket Rates</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                name="ticket_rates"
                                value={formData.ticket_rates}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="availability">
                            <Form.Check
                                type="checkbox"
                                name="availability"
                                label="Available"
                                checked={formData.availability}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="description">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="poster">
                            <Form.Label>Poster URL</Form.Label>
                            <Form.Control
                                type="text"
                                name="poster"
                                value={formData.poster}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="show_timings">
                            <Form.Label>Show Timings</Form.Label>
                            {showTimes.map((time) => (
                                <Form.Check
                                    key={time}
                                    type="checkbox"
                                    name="show_timings"
                                    label={time}
                                    value={time}
                                    checked={formData.show_timings.includes(time)}
                                    onChange={handleInputChange}
                                />
                            ))}
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Update Movie
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default checkAdmin(AdminHomePageComponent);
