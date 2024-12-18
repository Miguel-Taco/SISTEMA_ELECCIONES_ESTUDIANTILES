from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS
#ACTUAL
app = Flask(__name__)

# Habilitar CORS
CORS(app)
#deploy base de datos xhOoeGdxwdVhWEJpxVymzEybmhSmEdFv autorack.proxy.rlwy.net 31004
# Conectar a la base de datos
conexion = mysql.connector.connect(
    user='root',
    password='xhOoeGdxwdVhWEJpxVymzEybmhSmEdFv',
    host='autorack.proxy.rlwy.net',
    database='elecciones',
    port='31004'
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

        # Obtener el nombre del candidato
        candidato_query = "SELECT nombre_candidato FROM candidatos_fisi WHERE id_candidato = %s"
        cursor.execute(candidato_query, (id_candidato,))
        candidato = cursor.fetchone()

        if not candidato:
            return jsonify({"message": "Candidato no encontrado"}), 404

        nombre_candidato = candidato[0]

        if voto and voto[0] == 1:
            return jsonify({"message": "Ya has votado previamente. No puedes votar nuevamente.", 
                            "user_id": user_id, 
                            "nombre_candidato": nombre_candidato}), 400

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

        return jsonify({"message": "Voto registrado correctamente", 
                        "user_id": user_id, 
                        "nombre_candidato": nombre_candidato})
    except mysql.connector.Error as err:
        return jsonify({"message": f"Error al registrar el voto: {err}"}), 500
    finally:
        cursor.close()


# Endpoint para obtener la relación entre el estudiante y el candidato
@app.route('/relacion_voto', methods=['GET'])
def obtener_relacion_voto():
    user_id = request.args.get('user_id')  # Recibe el user_id (código del estudiante)

    if not user_id:
        return jsonify({"message": "El user_id es necesario"}), 400

    cursor = conexion.cursor()
    try:
        # Obtener los datos del estudiante y el candidato votado
        query = """
        SELECT e.codigo, e.nombres, e.apellidos, c.nombre_candidato
        FROM estudiantes_fisi e
        JOIN candidatos_fisi c ON e.id_candidato = c.id_candidato
        WHERE e.codigo = %s AND e.voto = 1
        """
        cursor.execute(query, (user_id,))
        resultado = cursor.fetchone()

        if not resultado:
            return jsonify({"message": "El estudiante no ha votado o no existe"}), 404

        # Desestructurar los resultados
        codigo, nombres, apellidos, nombre_candidato = resultado

        return jsonify({
            "codigo": codigo,
            "nombres": nombres + " " + apellidos,  # Concatenar nombres y apellidos
            "nombre_candidato": nombre_candidato
        })
    except mysql.connector.Error as err:
        return jsonify({"message": f"Error en la consulta: {err}"}), 500
    finally:
        cursor.close()



if __name__ == '__main__':
    app.run(debug=True)