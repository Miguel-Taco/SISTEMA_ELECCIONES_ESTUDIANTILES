import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import { useState, useContext } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../services/AuthContext'; // Ruta correcta desde 'components/Login.jsx'


const message = ['Usuario logueado correctamente', 'Error, Intente de nuevo'];

export default function Login() {
    const [openAlert, setOpenAlert] = useState(false);
    const [correo, setCorreo] = useState(""); 
    const [contraseña, setContraseña] = useState(""); 
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");  // Para manejar el mensaje de error
    const navigate = useNavigate();
    const { setIsAuthenticated, setUserId, userId } = useContext(AuthContext); // Obtener userId correctamente

    // Login.jsx (lo que ya tienes es correcto, solo asegúrate de que navigate lleve a '/home')
    const handleCloseAlert = () => {
        setOpenAlert(false);
        if (!error) {
            // Si el login fue exitoso, redirige al home
            navigate('/home');  // Redirige a la página Home
        }
    };


    // Login.jsx
    const handleSubmit = (event) => {
        event.preventDefault();
    
        const formData = new FormData();
        formData.append("username", correo);  // El correo que el usuario ingresó
        formData.append("password", contraseña);  // El DNI (contraseña en tu caso)
    
        fetch('http://localhost:5000/login', {
        method: 'POST',
        body: formData
        })
        .then(res => res.json())  // Cambio aquí, usamos .json() para obtener la respuesta como un objeto JSON
        .then(data => {
        if (data.message === 'Correo y DNI correctos') {
            // Si la respuesta es correcta, actualiza el estado de autenticación y redirige
            setUserId(data.user_id);  // Usar el ID que devuelve el backend
            setIsAuthenticated(true);  // Asegúrate de que esto se actualice correctamente
            setError(false);
            setErrorMessage("");
            setOpenAlert(true);
        } else {
            // Si la respuesta es un error
            setError(true);
            setErrorMessage(data.message);  // Mostrar el mensaje de error
            setOpenAlert(true);
        }
        })
        .catch(err => {
        console.error(err);
        setError(true);
        setErrorMessage("Error al conectar con el servidor");
        setOpenAlert(true);
        });
    };  

    const handleInputChange = (e, setter) => {
        setter(e.target.value);
    };

    return (
        <Grid container component="main" sx={{ height: { md: '100vh', xs: '100vh' } }}>
            <Dialog
                open={openAlert}
                onClose={handleCloseAlert}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
            >
                <DialogTitle id="alert-dialog-title">
                    {error 
                        ? errorMessage 
                        : userId ? `Bienvenido, Usuario. ID: ${userId}` : "Bienvenido, Usuario"}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={handleCloseAlert} color="primary" autoFocus>
                        Continuar
                    </Button>
                </DialogActions>
            </Dialog>

            <CssBaseline />
            <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    backgroundImage: 'url(https://sum.unmsm.edu.pe/alumnoWebSum/image/login-sum.jpg)',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'top',
                }}
            />
            <Link to={"/"}>
                <IconButton sx={{ position: 'absolute', backgroundColor: { sm: '#DDE2E5' }, color: 'gray', m: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
            </Link>

            <Grid item xs={12} sm={8} md={5} component={Paper} square>
                <Box
                    sx={{
                        my: 4,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h5">
                        Iniciar sesión
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            error={correo.length === 0}
                            helperText={correo.length === 0 ? "Correo no válido" : ""}
                            margin="normal"
                            required
                            fullWidth
                            id="correo"
                            label="Correo"
                            name="correo"
                            autoComplete="email"
                            autoFocus
                            value={correo}
                            onChange={(e) => handleInputChange(e, setCorreo)}
                        />
                        <TextField
                            error={contraseña.length === 0}
                            helperText={contraseña.length === 0 ? "Contraseña no válida" : ""}
                            margin="normal"
                            required
                            fullWidth
                            name="contraseña"
                            label="Contraseña"
                            type="password"
                            id="contraseña"
                            autoComplete="current-password"
                            value={contraseña}
                            onChange={(e) => handleInputChange(e, setContraseña)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ my: 2, backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#66bb6a' } }}
                        >
                            Verificar
                        </Button>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}
