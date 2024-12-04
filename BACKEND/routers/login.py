from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)

# Habilitar CORS
CORS(app)

# Conectar a la base de datos
conexion = mysql.connector.connect(
    user='root',
    password='root',
    host='localhost',
    database='elecciones',
    port='3306'
)

def verificar_credenciales(correo, dni):
    cursor = conexion.cursor()
    correo = correo.strip()
    
    try:
        dni = int(dni)
    except ValueError:
        return {"message": "El DNI debe ser un número válido"}

    query = """
    SELECT * FROM estudiantes_fisi
    WHERE correo LIKE %s AND dni = %s
    """

    try:
        cursor.execute(query, ('%' + correo + '%', dni))
        resultado = cursor.fetchone()

        if resultado:
            # Verificar si el estado es 'matriculado' (estado está en la columna 5, índice 5)
            estado = resultado[5]  # Columna estado, que es la 6ta (índice 5)
            if estado.lower() != 'matriculado':  # Comparar sin importar mayúsculas
                return {"message": "El usuario no está matriculado"}
            return {
                "message": "Correo y DNI correctos",
                "user_id": resultado[0],  # Suponiendo que 'codigo' es la PK y está en la columna 0
            }
        else:
            return {"message": "Correo o DNI incorrectos"}
    except mysql.connector.Error as err:
        return {"message": f"Error en la consulta: {err}"}
    finally:
        cursor.close()


# Función para obtener las probabilidades de los candidatos
def obtener_probabilidades():
    cursor = conexion.cursor()

    # Obtener la cantidad total de votos
    total_votos_query = "SELECT SUM(cantidad_votaciones) FROM candidatos_fisi"
    cursor.execute(total_votos_query)
    total_votos = cursor.fetchone()[0] or 0  # Si no hay votos, el total será 0

    if total_votos == 0:
        return {"message": "No hay votos registrados"}

    # Obtener las votaciones de cada candidato
    candidatos_query = "SELECT id_candidato, nombre_candidato, cantidad_votaciones FROM candidatos_fisi"
    cursor.execute(candidatos_query)
    candidatos = cursor.fetchall()

    probabilidades = []
    for candidato in candidatos:
        id_candidato, nombre_candidato, cantidad_votaciones = candidato
        probabilidad = (cantidad_votaciones / total_votos) * 100  # Probabilidad en porcentaje
        probabilidades.append({
            "id_candidato": id_candidato,
            "nombre_candidato": nombre_candidato,
            "probabilidad": round(probabilidad, 2)  # Redondear a 2 decimales
        })

    cursor.close()

    # Predicción del resultado
    prediccion = None
    if probabilidades:
        # Ordenar candidatos por probabilidad en orden descendente
        probabilidades.sort(key=lambda x: x['probabilidad'], reverse=True)
        prediccion = probabilidades[0]  # El candidato con mayor probabilidad es el predicho

    return {
        "candidatos": probabilidades,
        "prediccion": prediccion  # Candidato con mayor probabilidad
    }

@app.route('/probabilidades', methods=['GET'])
def probabilidades():
    resultado = obtener_probabilidades()
    return jsonify(resultado)


# Endpoint de login
@app.route('/login', methods=['POST'])
def login():
    correo = request.form.get('username')
    dni = request.form.get('password')

    if not correo or not dni:
        return jsonify({"message": "Correo y DNI son necesarios"}), 400

    resultado = verificar_credenciales(correo, dni)
    return jsonify(resultado)

# Endpoint de votación
@app.route('/votar', methods=['POST'])
def votar():
    user_id = request.json.get('user_id')  # Recibe el user_id (código del estudiante)
    id_candidato = request.json.get('id_candidato')  # Recibe el id_candidato seleccionado

    if not user_id or not id_candidato:
        return jsonify({"message": "user_id y id_candidato son necesarios"}), 400

    cursor = conexion.cursor()

    try:
        # Verificar si el estudiante ya ha votado
        check_voto_query = """
        SELECT voto FROM estudiantes_fisi WHERE codigo = %s
        """
        cursor.execute(check_voto_query, (user_id,))
        voto = cursor.fetchone()

        if voto and voto[0] == 1:
            return jsonify({"message": "Ya has votado previamente. No puedes votar nuevamente."}), 400

        # Actualizar el voto del estudiante
        update_estudiante_query = """
        UPDATE estudiantes_fisi
        SET voto = 1, id_candidato = %s
        WHERE codigo = %s
        """
        cursor.execute(update_estudiante_query, (id_candidato, user_id))

        # Incrementar las votaciones del candidato
        update_candidato_query = """
        UPDATE candidatos_fisi
        SET cantidad_votaciones = cantidad_votaciones + 1
        WHERE id_candidato = %s
        """
        cursor.execute(update_candidato_query, (id_candidato,))

        # Confirmar los cambios
        conexion.commit()
        return jsonify({"message": "Voto registrado correctamente"})
    except mysql.connector.Error as err:
        return jsonify({"message": f"Error al registrar el voto: {err}"}), 500
    finally:
        cursor.close()

if __name__ == '__main__':
    app.run(debug=True)
