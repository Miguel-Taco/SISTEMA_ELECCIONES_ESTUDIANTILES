from flask import Flask, request, jsonify
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# Configuración de la conexión
def obtener_conexion():
    return mysql.connector.connect(
        user='root',
        password='root',
        host='localhost',
        database='elecciones',
        port='3306'
    )

# Ruta para login
@app.route('/login', methods=['POST'])
def login():
    try:
        # Obtener los datos del cuerpo de la solicitud (correo y dni)
        correo = request.json.get('correo')
        dni = request.json.get('dni')

        # Verificar que los datos sean proporcionados
        if not correo or not dni:
            return jsonify({'message': 'Correo y DNI son requeridos'}), 400
        
        # Conexión a la base de datos
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        # Consulta para obtener el alumno por correo y DNI
        query = "SELECT * FROM estudiantes_fisi WHERE correo = %s AND dni = %s"
        cursor.execute(query, (correo, dni))
        resultado = cursor.fetchone()

        # Si no se encuentra al alumno, responder con error
        if not resultado:
            return jsonify({'message': 'Correo o DNI incorrectos'}), 401

        # Si el alumno existe, obtener el hash de la contraseña almacenada
        # Asumimos que el hash de la contraseña está en la columna 'estado' (puedes ajustarlo a tu estructura real)
        hashed_password = resultado[5]  # Supongamos que 'estado' tiene el hash de la contraseña (ajusta según tu estructura)

        # Comparar el hash almacenado con la contraseña proporcionada por el usuario (suponiendo que la contraseña está en 'dni')
        if check_password_hash(hashed_password, str(dni)):  # Si el DNI es la contraseña
            return jsonify({'message': 'Login exitoso', 'alumno': resultado[1]}), 200
        else:
            return jsonify({'message': 'Contraseña incorrecta'}), 401
    
    except mysql.connector.Error as err:
        return jsonify({'message': f'Error en la base de datos: {err}'}), 500
    finally:
        cursor.close()
        conexion.close()

if __name__ == '__main__':
    app.run(debug=True)
