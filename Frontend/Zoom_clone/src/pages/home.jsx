import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

import { Button, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import LogoutIcon from "@mui/icons-material/Logout";
import VideoCallIcon from "@mui/icons-material/VideoCall";

import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const { addToUserHistory } = useContext(AuthContext);

    const handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;

        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    return (
        <div className="homePage">

            {/* Navbar */}

            <nav className="navBar">

                <div className="logo">

                    <VideoCallIcon />

                    <h2>MeetSync</h2>

                </div>

                <div className="navRight">

                    <Button
                        startIcon={<RestoreIcon />}
                        className="historyBtn"
                        onClick={() => navigate("/history")}
                    >
                        History
                    </Button>

                    <Button
                        startIcon={<LogoutIcon />}
                        variant="contained"
                        className="logoutBtn"
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                    >
                        Logout
                    </Button>

                </div>

            </nav>

            {/* Hero */}

            <section className="meetContainer">

                <div className="leftPanel">

                    <span className="tag">
                        Simple • Secure • Reliable
                    </span>

                    <h1>
                        Connect with your team,
                        <br />
                        anytime, anywhere.
                    </h1>

                    <p className="heroText">
                        Join meetings instantly with a meeting code.
                        Enjoy HD video calls, real-time chat, screen sharing,
                        and meeting history—all in one place.
                    </p>

                    <div className="joinBox">

                        <TextField
                            fullWidth
                            label="Meeting Code"
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value)}
                        />

                        <Button
                            variant="contained"
                            className="joinBtn"
                            onClick={handleJoinVideoCall}
                        >
                            Join Meeting
                        </Button>

                    </div>

                </div>

                <div className="rightPanel">

                    <img
                        src="/logo3.png"
                        alt="MeetSync"
                    />

                </div>

            </section>

        </div>
    );
}

export default withAuth(HomeComponent);