import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Network } from 'vis-network/standalone'; // Cambiar la importación
import 'vis-network/styles/vis-network.css'; // Asegúrate de importar los estilos necesarios
import CODIGO_FISIANO_LOGO from "../imagenes/CODIGO_FISIANO.png";
import HAGAMOS from "../imagenes/HAGAMOS.png";
import INNOVA from "../imagenes/INOVA_FISI.png";
import ONPE from "../imagenes/logo-onpe.png";

const Probabilidades2 = () => {
  const [candidatos, setCandidatos] = useState([]);

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

  useEffect(() => {
    fetchProbabilidades();
  }, []); // El segundo argumento vacío [] significa que solo se ejecuta una vez al montar el componente

  useEffect(() => {
    if (candidatos.length > 0) {
      const nodes = candidatos.map((candidato) => ({
        id: candidato.nombre_candidato,
        label: candidato.nombre_candidato,
        title: `${candidato.nombre_candidato}: ${candidato.probabilidad}%`,
        size: 20, // Tamaño de los nodos
      }));

      const edges = candidatos.map((candidato, index) => ({
        from: candidatos[index === 0 ? candidatos.length - 1 : index - 1].nombre_candidato,
        to: candidato.nombre_candidato,
        value: Math.abs(candidato.probabilidad - (candidatos[index === 0 ? candidatos.length - 1 : index - 1].probabilidad)),
      }));

      const data = {
        nodes: nodes,
        edges: edges,
      };

      const options = {
        nodes: {
          shape: "dot",
          size: 20, // Tamaño de los nodos
          font: {
            size: 16,
          },
        },
        edges: {
          width: 2,
        },
        physics: {
          enabled: true, // Activamos la física para mover los nodos
          barnesHut: {
            gravitationalConstant: -20000, // Ajusta la gravedad (más negativo separará más los nodos)
            centralGravity: 0.3, // Controla la atracción hacia el centro
            springLength: 150, // Ajusta la distancia entre nodos (a mayor valor, mayor distancia)
            springConstant: 0.01, // Ajusta la fuerza de la primavera que conecta los nodos
          },
          solver: "barnesHut", // Usa el algoritmo de Barnes-Hut
        },
      };

      const container = document.getElementById("network");
      new Network(container, data, options);
    }
  }, [candidatos]);

  return (
    <div className="home-container">
      <div className="sidebar">
        <h2>Elecciones 2024</h2>
        <img src={ONPE} alt="ONPE" className="onpe-logo" />
        <Link to="/home">
          <button className="sidebar-button">Elección de candidato</button>
        </Link>
        <Link to="/home/probabilidades1">
          <button className="sidebar-button">Probabilidades </button>
        </Link>
      </div>

      <div className="main-content">
        <h3>Red de Probabilidades de Voto</h3>
        {/* Mostrar el contenedor del grafo con un tamaño mayor */}
        <div id="network" style={{ height: "700px", width: "100%" }}></div>

        {/* Botones debajo del grafo para cambiar entre las páginas */}
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

export default Probabilidades2;
