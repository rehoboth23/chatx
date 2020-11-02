import * as actionTypes from './actionTypes';
import axios from 'axios'
const loc = window.location
// const auth_url = `${loc.origin}/authenticate/`
const auth_url = `http://localhost:8000/authenticate/`

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
}

export const authSuccess = token => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        token: token
    }
}

export const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error,
    }
}

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    return {
        type: actionTypes.AUTH_LOGOUT
    };
}

export const checkAuthTimeout = expirationTime => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime * 1000)
    }
}

export const authLogin = (email, password) => {
    return dispatch => {
        dispatch(authStart());
        fetch(auth_url, {
            'method': 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(res => res.json())
            .then(data => {
                const error = data[0]
                const errorMessage = error ? JSON.parse(error)['non_field_errors']: null
                if(errorMessage) {
                    throw Error (errorMessage)
                }
                const token = data.token;
                if (token){
                    const expirationDate = new Date(new Date().getTime() + 3600*24 * 1000);
                    localStorage.setItem('token', token);
                    localStorage.setItem('expirationDate', expirationDate);
                    dispatch(authSuccess(token));
                    dispatch(checkAuthTimeout(3600*24));
                }
            })
                .catch(err => {
                    dispatch(authFail(err))
                })
    }
}

export const authSignup = (name, email, password1, password2) => {
    return dispatch => {
        dispatch(authStart());
        fetch(auth_url, {
            'method': 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password1: password1,
                password2: password2
            })
        })
        .then(res => res.json())
            .then(data => {
                const emailErrors = data['email']
                const passwordErrors = data['password']

                if (emailErrors || passwordErrors) {
                    localStorage.setItem('emailErrors', emailErrors)
                    localStorage.setItem('passwordErrors', passwordErrors)
                    throw Error("Bad Input")
                }
                const token = data.token;
                if (token){
                    localStorage.removeItem('emailErrors')
                    localStorage.removeItem('passwordErrors')
                    const expirationDate = new Date(new Date().getTime() + 3600*24 * 1000);
                    localStorage.setItem('token', token);
                    localStorage.setItem('expirationDate', expirationDate);
                    dispatch(authSuccess(token));
                    dispatch(checkAuthTimeout(3600*24));
                }
            })
                .catch(err => {
                    dispatch(authFail(err))
                })
    }
}

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token');
        if (token === undefined) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'));
            if ( expirationDate <= new Date() ) {
                dispatch(logout());
            } else {
                dispatch(authSuccess(token));
                dispatch(checkAuthTimeout( (expirationDate.getTime() - new Date().getTime()) / 1000) );
            }
        }
    }
}
