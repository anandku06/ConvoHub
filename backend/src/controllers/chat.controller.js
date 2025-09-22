import { generateStreamToken } from "../config/stream";

export const getStreamToken = (req, res) => {
    try {
        const token = generateStreamToken(req.auth().userId);

        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        console.error("Error generating Stream token:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate Stream token"
        });
    }
}