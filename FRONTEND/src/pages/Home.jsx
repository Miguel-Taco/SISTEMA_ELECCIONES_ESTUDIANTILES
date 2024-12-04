import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Importar Link de react-router-dom
import { AuthContext } from "../services/AuthContext"; // Contexto para obtener el userId
import "./Home.css";
import CODIGO_FISIANO_LOGO from "../imagenes/CODIGO_FISIANO.png";
import HAGAMOS from "../imagenes/HAGAMOS.png";
import INNOVA from "../imagenes/Idea.png";
import ONPE from "../imagenes/logo-onpe.png";

const Home = () => {
  const { userId } = useContext(AuthContext); // Obtener el userId del contexto
  const [selectedCandidato, setSelectedCandidato] = useState(null); // Candidato seleccionado
  const [errorMessage, setErrorMessage] = useState(""); // Mensajes de error
  const [votoRegistrado, setVotoRegistrado] = useState(null); // Información del voto registrado
  const [relacionVoto, setRelacionVoto] = useState(null); // Información de la relación voto
  const [isRelacionVisible, setIsRelacionVisible] = useState(false); // Estado para controlar la visibilidad de la relación

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
          setVotoRegistrado({
            codigo: userId,
            nombre_candidato: selectedCandidato === 1
              ? "Innova FISI"
              : selectedCandidato === 2
              ? "Hagamos"
              : "Código Fisiano"
          });
        } else {
          setErrorMessage(data.message); // Mostrar mensaje de error
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        setErrorMessage("Hubo un error al registrar tu voto.");
      });
  };

  const getRelacionVoto = () => {
    if (!userId) {
      alert("Por favor, inicie sesión para ver su voto.");
      return;
    }
  
    fetch(`http://localhost:5000/relacion_voto?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setErrorMessage(data.message); // Mostrar mensaje de error
        } else {
          console.log('Datos de la relación de voto:', data); // Agregado para depuración
          setRelacionVoto(data); // Guardar la relación en el estado
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        setErrorMessage("Hubo un error al obtener la relación de voto.");
      });
  };
  

  const handleRelacionToggle = () => {
    setIsRelacionVisible(!isRelacionVisible);
    if (!isRelacionVisible) { // Solo obtener la relación si está visible
      getRelacionVoto(); // Llamar a la función para obtener la relación del voto
    }
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
              onClick={() => handleCardClick("Idea FISI", 1)}
            >
              <img
                src={INNOVA}
                alt="Idea FISI"
                className="card-logo_idea"
              />
              <div className="text">
                <a href="https://www.facebook.com/share/p/17Hcq2eor4/" target="_blank" rel="noopener noreferrer">
                  Ver Propuestas
                </a>
              </div>
            </button>

            {/* Tarjeta 2 */}
            <button
              className={`card ${selectedCandidato === 2 ? "selected" : ""}`}
              onClick={() => handleCardClick("Hagamos", 2)}
            >
              <img src={HAGAMOS} alt="Hagamos" className="card-logo_hagamos" />
              <div className="text">
                <a href="https://www.facebook.com/share/p/19a8csjAWC/" target="_blank" rel="noopener noreferrer">
                  Ver Propuestas
                </a>  
              </div>
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
              <div className="text">
                <a href="https://www.facebook.com/share/p/1Bc45ZTVj3/" target="_blank" rel="noopener noreferrer">
                  Ver Propuestas
                </a>   
              </div>
            </button>

        </div>
  
        {/* Botón para votar */}
        {selectedCandidato && (
          <button
            className="vote-button"
            onClick={() => handleVote(selectedCandidato)}
          >
            Votar por {selectedCandidato === 1
              ? "Idea FISI"
              : selectedCandidato === 2
              ? "Hagamos"
              : "Código Fisiano"}
          </button>
        )}
        
        <button
          onClick={handleRelacionToggle}
          className={`Relacion ${isRelacionVisible ? "visible" : ""}`}
        >
          {isRelacionVisible ? "Ocultar Relación de Voto" : "Ver Relación de Voto"}
        </button>


  
        {/* Mostrar mensaje de error */}
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}
  
        
  
        {/* Mostrar la relación de voto */}
        {isRelacionVisible && relacionVoto && (
          <div className="card relacion-voto">
            <h3>Relación entre Estudiante y Candidato:</h3>
            <div className="relacion-voto-content">
              <div className="left-column">
                <p><strong>Código Estudiante:</strong> {relacionVoto.codigo}</p>
                <p><strong>Nombre Estudiante:</strong> {relacionVoto.nombres}</p>
              </div>
              <div className="right-column">
                <p><strong>Candidato Votado:</strong> {relacionVoto.nombre_candidato}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
  
};

export default Home;
