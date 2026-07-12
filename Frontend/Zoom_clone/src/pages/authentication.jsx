import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Snackbar } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import bg from "../assets/authBgimage.jpeg";
import { useNavigate } from "react-router-dom";

const defaultTheme = createTheme();

export default function Authentication() {
//   const [username, setUsername] = React.useState("");
//   const [password, setPassword] = React.useState("");
//   const [name, setName] = React.useState("");
//   const [error, setError] = React.useState("");
//   const [message, setMessage] = React.useState("");

//   const [formState, setFormState] = React.useState(0);
//   const [open, setOpen] = React.useState(false);

//   const handleAuth = async () => {
//     try {
//       if (formState === 0) {
//         // Login
//         console.log("Login:", { username, password });

//         // TODO: Call login API here
//       } else {
//         // Register
//         console.log("Register:", { name, username, password });

//         // TODO: Call register API here

//         setMessage("Registration Successful!");
//         setOpen(true);

//         setName("");
//         setUsername("");
//         setPassword("");
//         setError("");
//         setFormState(0);
//       }
//     } catch (err) {
//       setError("Something went wrong");
//     }
//   };

    const[username,setUsername] = React.useState()
    const[formState,setFormState] = React.useState(0) // to check whether we doing sigup or signin
    const[password,setPassword] = React.useState();
    const[name,setName] = React.useState();
    const [error,setError] = React.useState();
    const [message,setMessage] = React.useState();
    const [open,setOpen] = React.useState(false);//for implementing snackbar
    const{handleRegister,handleLogin} = React.useContext(AuthContext)
    const navigate = useNavigate();

    let handleSnackBarClose = ()=>{
        setOpen(false)
    }

    const handleAuth = async () => {
    try {
        if (formState === 0) {
            const result = await handleLogin(username, password);

            setMessage(result);
            setError("");
            setOpen(true);

            setUsername("");
            setPassword("");

            // Redirect to Home page
            navigate("/home");
        }

        if (formState === 1) {
            const result = await handleRegister(name, username, password);

            setMessage(result);
            setOpen(true);

            setName("");
            setUsername("");
            setPassword("");
            setError("");

            setFormState(0);
        }
    } catch (error) {
        setError(error.response?.data?.message || "Something went wrong");
    }
};

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />

        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              `url(${bg})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            <div>
              <Button
                variant={formState === 0 ? "contained" : ""} // "0" for login(signin) and "1" for register(signup)
                onClick={() => setFormState(0)}
              >
                Sign In
              </Button>

              <Button
                variant={formState === 1 ? "contained" : ""}
                onClick={() => setFormState(1)}
              >
                Sign Up
              </Button>
            </div>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="password"
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <p style={{ color: "red" }}>{error}</p>

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={()=>{
                    console.log("button clicked")
                    handleAuth()
                }}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={handleSnackBarClose}
        message={message}
      />
    </ThemeProvider>
  );
}