import React, { useContext, useState } from "react";
import { Link } from "react-router-dom"; // Importar Link de react-router-dom
import { AuthContext } from "../services/AuthContext"; // Contexto para obtener el userId
import "./Home.css";
import Probabilidades from './Probabilidades1'; // Importación correcta
import CODIGO_FISIANO_LOGO from "../imagenes/CODIGO_FISIANO.png";
import HAGAMOS from "../imagenes/HAGAMOS.png";
import INNOVA from "../imagenes/INOVA_FISI.png";
import ONPE from "../imagenes/logo-onpe.png";

const Home = () => {
  const { userId } = useContext(AuthContext); // Obtener el userId del contexto
  const [selectedCandidato, setSelectedCandidato] = useState(null); // Candidato seleccionado
  const [errorMessage, setErrorMessage] = useState(""); // Mensajes de error

  const handleVote = (idCandidato) => {
    if (!userId) {
      alert("Por favor, inicie sesión para votar.");
      return;
    }

    // Realizar la solicitud para registrar el voto
    fetch("http://localhost:5000/votar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId, // El código del estudiante
        id_candidato: idCandidato, // ID del candidato seleccionado
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Voto registrado correctamente") {
          alert("Tu voto ha sido registrado correctamente.");
        } else {
          setErrorMessage(data.message); // Mostrar mensaje de error
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        setErrorMessage("Hubo un error al registrar tu voto.");
      });
  };

  const handleCardClick = (name, id) => {
    setSelectedCandidato(id); // Actualizar el candidato seleccionado
    console.log(`Seleccionaste: ${name}`);
  };

  return (
    <div className="home-container">
      <div className="sidebar">
        <h2>Elecciones 2024</h2>
        <img src={ONPE} alt="ONPE" className="onpe-logo" />
        <Link to="/home">
          <button className="sidebar-button">Elección de candidato</button>
        </Link>
        <Link to="/home/probabilidades1">
          <button className="sidebar-button">Probabilidades</button>
        </Link>
      </div>
      <div className="main-content">
        <div className="card-container">
          {/* Tarjeta 1 */}
          <button
            className={`card ${selectedCandidato === 1 ? "selected" : ""}`}
            onClick={() => handleCardClick("Innova FISI", 1)}
          >
            <img
              src={INNOVA}
              alt="Idea FISI"
              className="card-logo_idea"
            />
            <div className="text">Ver Propuestas</div>
          </button>
          {/* Tarjeta 2 */}
          <button
            className={`card ${selectedCandidato === 2 ? "selected" : ""}`}
            onClick={() => handleCardClick("Hagamos", 2)}
          >
            <img src={HAGAMOS} alt="Hagamos" className="card-logo_hagamos" />
            <div className="text">Ver Propuestas</div>
          </button>
          {/* Tarjeta 3 */}
          <button
            className={`card ${selectedCandidato === 3 ? "selected" : ""}`}
            onClick={() => handleCardClick("Código Fisiano", 3)}
          >
            <img
              src={CODIGO_FISIANO_LOGO}
              alt="Código Fisiano"
              className="card-logo_codigofisiano"
            />
            <div className="text">Ver Propuestas</div>
          </button>
        </div>

        {/* Botón para votar */}
        {selectedCandidato && (
          <button
            className="vote-button"
            onClick={() => handleVote(selectedCandidato)}
          >
            Votar por {selectedCandidato === 1
              ? "Innova FISI"
              : selectedCandidato === 2
              ? "Hagamos"
              : "Código Fisiano"}
          </button>
        )}

        {/* Mostrar mensaje de error */}
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
