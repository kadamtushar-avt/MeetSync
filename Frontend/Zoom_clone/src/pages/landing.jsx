import React from "react";
import "../App.css"
import { Link, useNavigate } from "react-router-dom";
export default function LandingPage(){

    const router = useNavigate();

    return(
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>MeetSync</h2>
                </div>
                <div className="navList">
                    <p onClick={()=>{
                        router("/dvywyq")
                    }}>Join as Guest</p>
                    <p onClick={()=>{
                        router("/auth")}}>Register</p>


                    <div role="button" onClick={()=>{
                        router("/auth")
                    }}>Login</div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    
                    <h1><span style={{color:"#ff9839"}}>Connect </span>with your loved ones</h1>
                    <p>Cover a distance by MeetSync</p>
                    <div role="button">
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="/public/mobile.png"></img>
                </div>
            </div>

        </div>
    );
}