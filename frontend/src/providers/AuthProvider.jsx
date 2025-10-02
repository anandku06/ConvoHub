import { createContext, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    // setup axios interceptor
    const interceptor = axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
          if (
            (error.message, includes("auth") || error.message.includes("token"))
          ) {
            toast.error("Authentication error. Please sign in again.");
          }
          console.error("Error fetching token:", error);
        }

        return config;
      },
      (error) => {
        console.error("Error in request interceptor:", error);
        return Promise.reject(error);
      }
    );

    // Cleanup function to eject the interceptor when the component unmounts
    // bcz useEffect can be called multiple times
    return () => {
        axiosInstance.interceptors.request.eject(interceptor);
    }
  }, [getToken]);

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  )
};

// Axios Interceptor are used to attach the JWT token to every request
// made using the axios instance. This ensures that the backend can
// verify the identity of the user making the request.
// this interceptor 