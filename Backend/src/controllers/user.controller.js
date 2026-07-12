import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(httpStatus.BAD_REQUEST)
            .json({ message: "Please provide username and password" });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res
                .status(httpStatus.NOT_FOUND)
                .json({ message: "User Not Found" });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ message: "Invalid Username or Password" });
        }

        const token = crypto.randomBytes(20).toString("hex");

        user.token = token;
        await user.save();

        return res.status(httpStatus.OK).json({
            token,
            message: "Login Successful",
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: `Something went wrong: ${e.message}`,
        });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res
                .status(httpStatus.FOUND)
                .json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            password: hashedPassword,
        });

        await newUser.save();

        return res.status(httpStatus.CREATED).json({
            message: "User Registered Successfully",
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: `Something went wrong: ${e.message}`,
        });
    }
};

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "User not found",
            });
        }

        const meetings = await Meeting.find({
            user_id: user.username,
        });

        return res.status(httpStatus.OK).json(meetings);
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: `Something went wrong: ${e.message}`,
        });
    }
};

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    console.log("========== ADD TO HISTORY ==========");
    console.log("Token:", token);
    console.log("Meeting Code:", meeting_code);

    try {
        const user = await User.findOne({ token });

        console.log("User:", user);

        if (!user) {
            return res.status(404).json({
                message: "Invalid Token",
            });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code,
        });

        console.log("Meeting Object:", newMeeting);

        await newMeeting.save();

        return res.status(201).json({
            message: "Added code to history",
        });

    } catch (e) {
        console.error("ERROR:");
        console.error(e);

        return res.status(500).json({
            message: e.message,
        });
    }
};

export {
    login,
    register,
    getUserHistory,
    addToHistory,
};