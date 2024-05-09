import React, {useState, useEffect} from 'react';
import * as Realm from "realm-web";
import { app } from './realm';
import { useNavigate } from 'react-router-dom';
import './styles/loginPage.scss';

//loading spinner
import ClipLoader from "react-spinners/ClipLoader";

export default function LoginPage() {
    const navigate = useNavigate();

    //inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    //boolean states
    const [isLogin, setIsLogin] = useState(false)
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if(app?.currentUser){
            navigate('/dashboard');
        }else{
            setIsLogin(true);
        }
    }, [])

    const handleLogin = async (e) => {
        try {
            e.preventDefault();
            await app.logIn(Realm.Credentials.emailPassword(email, password));
            navigate('/dashboard');
        } catch (error) {
            console.log('issue: ' + error);
            setIsError(true);
        }
    }

    return (
        <main className='loginPage'>
            {(() => {
                if(isLogin){
                    return(
                        <>
                            <h1>Spatula Software</h1>
                            {(() => {
                                if(isError){
                                    return(
                                        <div className="errorMessage">
                                            <h3>Error with login</h3>
                                            <p>Incorrect Useranme or Password</p>
                                        </div>
                                    )
                                }
                            })()}
                            <form onSubmit={handleLogin} className="loginContainer">
                                <input type="email" placeholder='Email' name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                <input type="password" name="pass" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                                <input type="submit" value="Login" />
                            </form>
                        </>
                    )
                }else{
                    return(
                        <div className="initialLoad">
                            <ClipLoader
                                color='#9d9d9d'
                                size={50}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </div>   
                    )
                }
            })()}

        </main>
    )
}
