import React, { useEffect, useState } from 'react';
import { auth, provider } from './config';
import { signInWithPopup } from 'firebase/auth';
import Home from '../Components/Home';
import './SignIn.css';

function SignIn() {
    const [email, setEmail] = useState('');

    const handleClick = () => {
        signInWithPopup(auth, provider)
            .then((data) => {
                const userEmail = data.user.email;
                setEmail(userEmail);
                localStorage.setItem('email', userEmail);
            })
            .catch((error) => {
                console.error('Error signing in:', error);
            });
    };

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('email');
        setEmail('');
    };

    return (
        <>  
        <div className='container'>
            <h1 className='heading'>NoteApp</h1>
             {email ? <Home email={email} handleLogout={handleLogout} /> : <button className='SignButton' onClick={handleClick}>Sign In with Google</button>}
        </div>
        </>
    );
}

export default SignIn;
