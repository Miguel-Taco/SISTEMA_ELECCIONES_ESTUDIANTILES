import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2"; // Importamos el componente Bar de react-chartjs-2
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import "./Probabilidades1.css";
import ONPE from "../imagenes/logo-onpe.png";

// Registrar los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Probabilidades = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [selectedCandidato, setSelectedCandidato] = useState(null);

  // Fetch para obtener las probabilidades de los candidatos
  const fetchProbabilidades = async () => {
    try {
      const response = await fetch('http://localhost:5000/probabilidades');
      const data = await response.json();
      setCandidatos(data.candidatos);
    } catch (error) {
      console.error('Error al obtener las probabilidades:', error);
    }
  };

  // Llamar a la función para obtener las probabilidades cada 5 segundos
  useEffect(() => {
    fetchProbabilidades(); // Llamar una vez cuando se monta el componente
    const intervalId = setInterval(fetchProbabilidades, 5000); // Actualizar cada 5 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  // Configuración de la gráfica de barras
  const data = {
    labels: candidatos.map((candidato) => candidato.nombre_candidato),
    datasets: [
      {
        label: "Probabilidades de Voto (%)",
        data: candidatos.map((candidato) => candidato.probabilidad),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
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
        <h3>Probabilidades de Voto</h3>
        {/* Mostrar la gráfica de barras */}
        {candidatos.length > 0 ? (
          <Bar data={data} options={{ responsive: true }} />
        ) : (
          <p>Cargando probabilidades...</p>
        )}
        <div className="navigation-buttons">
          <Link to="/home/probabilidades1">
            <button className="btn-navigation">Ver Probabilidades 1</button>
          </Link>
          <Link to="/home/probabilidades2">
            <button className="btn-navigation">Ver Probabilidades 2</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Probabilidades;
