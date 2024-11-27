import mysql.connector

conexion = mysql.connector.connect(user='root', 
                                               password='root', 
                                               host='localhost', 
                                               database='elecciones', 
                                               port='3306')
print("Conexión exitosa")
            
mycursor = conexion.cursor()
codigo_alumno = '23200116'
mycursor.callproc('getAlumno', [codigo_alumno])
for result in mycursor.stored_results():
            myresult = result.fetchall()  # Recuperar todas las filas del resultado
            for fila in myresult:
                print(fila) 
mycursor.close()