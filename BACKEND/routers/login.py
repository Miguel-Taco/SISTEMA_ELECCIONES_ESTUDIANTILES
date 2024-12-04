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

# Verificar las credenciales
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
            return {
                "message": "Correo y DNI correctos",
                "user_id": resultado[0],
            }
        else:
            return {"message": "Correo o DNI incorrectos"}
    except mysql.connector.Error as err:
        return {"message": f"Error en la consulta: {err}"}
    finally:
        cursor.close()

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
