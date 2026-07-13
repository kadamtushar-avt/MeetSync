import { Children, createContext, useState } from "react";
import axios from "axios"
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status"
import server from "../environment";


//writing login and logout fuctions here
export const AuthContext = createContext({});

const client = axios.create({
    baseURL:`${server}/users`
})




export const AuthProvider = ({children})=>{
    const authContext = useContext(AuthContext);

    const[userData,setUserData] = useState(authContext);

    const router = useNavigate();

    

    

        
    const handleRegister = async(name,username,password)=>{
        try {
            let request = await client.post("/register",{
                name:name,
                username:username,
                password:password
            })
            console.log("inside handleregister")
            if(request.status === httpStatus.CREATED){
                return request.data.message;
            }
        } catch (error) {
            throw error;
        }
    }

    const handleLogin = async(username,password)=>{
        try {
            console.log("handle Login")
            let request = await client.post("/login",{
                username:username,password:password
            })

            if(request.status === httpStatus.OK){
                localStorage.setItem("token",request.data.token);
                return request.data.message

            }
        } catch (error) {
            throw error;
        }
    }

    const getHistoryOfUser = async()=>{
        try {
            let request = await client.get("/get_all_activity",{
                params:{
                    token:localStorage.getItem("token")
                }
            })
            return request.data
        } catch (error) {
            throw error
        }
    }
    const addToUserHistory = async (meetingCode) => {
    try {
        const token = localStorage.getItem("token");

        console.log("Token:", token);
        console.log("Meeting Code:", meetingCode);

        const request = await client.post("/add_to_activity", {
            token,
            meeting_code: meetingCode,
        });

        console.log(request.data);

        return request.data.message;
    } catch (error) {
        console.log(error.response?.data);
        throw error;
    }
};

    const data = {
        userData,setUserData,handleRegister,handleLogin,addToUserHistory,getHistoryOfUser
    }



    return(
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )

}

