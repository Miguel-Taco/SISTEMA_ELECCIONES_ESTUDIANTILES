from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS  # Importar CORS

app = Flask(__name__)

# Habilitar CORS para todas las rutas
CORS(app)  # Permite solicitudes desde cualquier origen

# O, si prefieres habilitar CORS solo para tu frontend:
# CORS(app, origins="http://localhost:5173")

# Conectar a la base de datos
conexion = mysql.connector.connect(
    user='root',
    password='root',
    host='localhost',
    database='elecciones',
    port='3306'
)

# Función para verificar las credenciales
def verificar_credenciales(correo, dni):
    # Crear un cursor para ejecutar la consulta
    cursor = conexion.cursor()

    # Limpiar el correo (eliminar posibles espacios al principio y al final)
    correo = correo.strip()

    # Asegurarse de que el DNI sea un número entero
    try:
        dni = int(dni)
    except ValueError:
        return {"message": "El DNI debe ser un número válido"}

    # Imprimir los parámetros que estamos usando en la consulta
    print(f"Ejecutando consulta con: correo = {correo}, dni = {dni}")  # Depuración

    # Consulta SQL para verificar el correo y DNI
    query = """
    SELECT * FROM estudiantes_fisi
    WHERE correo LIKE %s AND dni = %s
    """

    try:
        # Ejecutar la consulta pasando los parámetros de forma segura
        cursor.execute(query, ('%' + correo + '%', dni))

        # Obtener el primer resultado
        resultado = cursor.fetchone()

        if resultado:
            # Si se encontró el registro, la autenticación es exitosa
            print("Credenciales correctas.")  # Depuración
            return {
                "message": "Correo y DNI correctos",
                "user_id": resultado[0],  # Asumiendo que el ID de usuario está en la primera columna
            }
        else:
            # Si no se encuentra el registro o las credenciales son incorrectas
            print("No se encontró el registro en la base de datos.")  # Depuración
            return {"message": "Correo o DNI incorrectos"}
    except mysql.connector.Error as err:
        print(f"Error en la consulta: {err}")  # Depuración
        return {"message": f"Error en la consulta: {err}"}
    finally:
        # Cerrar el cursor
        cursor.close()

# Endpoint para el login
@app.route('/login', methods=['POST'])
def login():
    # Obtener datos del formulario
    correo = request.form.get('username')
    dni = request.form.get('password')

    print(f"Correo recibido: {correo}, DNI recibido: {dni}")  # Agregar para depuración

    if not correo or not dni:
        return jsonify({"message": "Correo y DNI son necesarios"}), 400

    # Verificar las credenciales
    resultado = verificar_credenciales(correo, dni)

    print(f"Resultado de la verificación: {resultado}")  # Depuración

    return jsonify(resultado)

if __name__ == '__main__':
    app.run(debug=True)
