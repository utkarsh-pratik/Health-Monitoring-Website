import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase.js";
import { useDispatch } from "react-redux";
import {signInSuccess} from "../redux/user/userSlice.js";
import { useNavigate } from "react-router-dom";
import api from '../api';

const OAuth = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleClick = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);

            const result = await signInWithPopup(auth, provider);
            
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await api.post('/api/auth/google', {
                name: result.user.displayName,
                email: result.user.email,
                photo: result.user.photoURL,
            });

            const data = res.data;

            dispatch(signInSuccess(data));
            navigate("/");         

            
        } catch (error) {
            console.log('Could not sign in with Google', error);
        }
    };


  return (
    <button onClick={handleGoogleClick} type="button" className="bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95">
      Continue with Google
    </button>
  )
};

export default OAuth;
