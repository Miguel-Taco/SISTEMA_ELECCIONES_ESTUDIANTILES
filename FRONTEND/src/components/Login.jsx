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
import './Login.css';
//logo fisi: https://sistemas.unmsm.edu.pe/site/images/logo-fisi-header-240x105.png
const message = ['Usuario logueado correctamente', 'Error, Intente de nuevo'];
import logoOnpe from '../imagenes/logo-onpe.png';
import logoFisi from '../imagenes/logo-fisi-header-240x105.png';



export default function Login() {
    const [openAlert, setOpenAlert] = useState(false);
    const [correo, setCorreo] = useState(""); 
    const [contraseña, setContraseña] = useState(""); 
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");  // Para manejar el mensaje de error
    const navigate = useNavigate();
    const { setIsAuthenticated, setUserId, userId } = useContext(AuthContext); // Obtener userId correctamente

    const handleCloseAlert = () => {
        setOpenAlert(false);
        if (!error) {
            navigate('/home');  // Redirige a la página Home
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
    
        const formData = new FormData();
        formData.append("username", correo);  
        formData.append("password", contraseña);  
    
        fetch('http://localhost:5000/login', {
        method: 'POST',
        body: formData
        })
        .then(res => res.json())
        .then(data => {
        if (data.message === 'Correo y DNI correctos') {
            setUserId(data.user_id); 
            setIsAuthenticated(true); 
            setError(false);
            setErrorMessage("");
            setOpenAlert(true);
        } else {
            setError(true);
            setErrorMessage(data.message); 
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
        <Grid>
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

            <div className="login-card-container">
                <Typography component="h1" variant="h5">
                    Elecciones 2024
                </Typography>
                <div className="image">
                    <img src={logoOnpe} className="img-responsive" />
                </div>
                
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
                    sx={{
                        // Estilos para asegurar que el borde y el texto son blancos siempre
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: 'white', // El borde siempre será blanco
                            },
                            '& input': {
                                color: 'white', // El texto dentro del input siempre será blanco
                            },
                        },
                        '& .MuiFormLabel-root': {
                            color: 'white', // La etiqueta siempre será blanca
                        },
                        '& .MuiFormHelperText-root': {
                            color: 'white', // El texto del helper también será blanco
                        },
                        '& .MuiFormLabel-root .Mui-required': {
                            color: 'white', // Cambiar el color del asterisco a blanco
                        },
                        // Cambios especiales cuando hay error
                        '& .MuiOutlinedInput-root.Mui-error': {
                            '& fieldset': {
                                borderColor: 'white', // El borde permanece blanco incluso en error
                            },
                            '& input': {
                                color: 'white', // El texto permanece blanco incluso en error
                            },
                        },
                        '& .MuiFormLabel-root.Mui-error': {
                            color: 'white', // La etiqueta se pone blanca en caso de error
                        },
                        '& .MuiFormHelperText-root.Mui-error': {
                            color: 'white', // El texto del helper también será blanco en caso de error
                        },
                    }}
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
                    sx={{
                        // Estilos para asegurar que el borde y el texto son blancos siempre
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: 'white', // El borde siempre será blanco
                            },
                            '& input': {
                                color: 'white', // El texto dentro del input siempre será blanco
                            },
                        },
                        '& .MuiFormLabel-root': {
                            color: 'white', // La etiqueta siempre será blanca
                        },
                        '& .MuiFormHelperText-root': {
                            color: 'white', // El texto del helper también será blanco
                        },
                        '& .MuiFormLabel-root .Mui-required': {
                            color: 'white', // Cambiar el color del asterisco a blanco
                        },
                        // Cambios especiales cuando hay error
                        '& .MuiOutlinedInput-root.Mui-error': {
                            '& fieldset': {
                                borderColor: 'white', // El borde permanece blanco incluso en error
                            },
                            '& input': {
                                color: 'white', // El texto permanece blanco incluso en error
                            },
                        },
                        '& .MuiFormLabel-root.Mui-error': {
                            color: 'white', // La etiqueta se pone blanca en caso de error
                        },
                        '& .MuiFormHelperText-root.Mui-error': {
                            color: 'white', // El texto del helper también será blanco en caso de error
                        },
                    }}
                />

                    <Button
                        type="submit"
                        fullWidth
                    >
                        Iniciar Sesión
                    </Button>
                    <div className="image1">
                    <img src={logoFisi} className="img-responsive" />
                    </div>
                </Box>
            </div>
        </Grid>
    );
}
