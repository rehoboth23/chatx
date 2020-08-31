import React, {Component} from "react";
import $ from "jquery"
import "../../login.css"
import {Redirect, withRouter} from "react-router";
import * as action from "../../store/actions/auth"
import {connect} from "react-redux"

class Auth extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginEmail:"",
            loginPassword:"",
            signUpEmail:"",
            signUpName:"",
            signUpPassword1:"",
            signUpPassword2:""
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }
    componentDidMount() {
        localStorage.removeItem('emailErrors')
        localStorage.removeItem('passwordErrors')
        const container = $('#container')
        const signUpButton = $("#signUp")
        const signInButton = $("#signIn")
        signInButton.click(event => {
            container.removeClass("right-panel-active")
        })
        signUpButton.click(event => {
            container.addClass("right-panel-active")
        })
    }

    handleChange(event) {
        const {name, value} = event.target
        this.setState({[name]: value})
    }

    handleSubmit(event){
        event.preventDefault()
        const {id} = event.target
        if(id === "loginForm") {
            this.props.onAuth(this.state.loginEmail, this.state.loginPassword)
            this.setState({loginPassword: ""})
        } else if(id === "signupForm") {
            this.props.onRegister(this.state.signUpName, this.state.signUpEmail, this.state.signUpPassword1, this.state.signUpPassword2)
            this.setState({signUpPassword1: ""})
            this.setState({signUpPassword2: ""})
        }
    }

    render() {
        return(
            <span id="authbody" className="authbody">
                {
                    this.props.isAuthenticated ? <Redirect push to={"/chat"} /> : null
                }
                <main className="authbody container" id="container">
                    <div className="authbody form-container sign-up-container">
                        <form method="post" id="signupForm" onSubmit={this.handleSubmit}>
                            <div className="authbody">
                                <h1 className="authbody">Create Account</h1>
                                <span className="authbody">or use your email for registration</span>
                            </div>
                            <div style={{"color": "#ba2121", "width": "100%"}} id = "formDiv" className="authbody">
                                <input
                                    className="authbody form-control"
                                    type={"text"}
                                    name={"signUpName"}
                                    placeholder="John Doe"
                                    onChange={this.handleChange}
                                    value={this.state.signUpName}
                                />
                                {
                                    localStorage.getItem('emailErrors')
                                        ?
                                    <h1 className={'error'}>
                                        {localStorage.getItem('emailErrors')}
                                    </h1>
                                        :
                                    null
                                }
                                <input
                                    className="authbody form-control"
                                    type={"email"}
                                    name={"signUpEmail"}
                                    placeholder="example@mail.com"
                                    onChange={this.handleChange}
                                    value={this.state.signUpEmail}
                                />
                                {
                                    localStorage.getItem('passwordErrors')
                                        ?
                                    <h1 className={'error'}>
                                        {localStorage.getItem('passwordErrors')}
                                    </h1>
                                        :
                                    null
                                }
                                <input
                                    className="authbody form-control"
                                    type={"password"}
                                    name={"signUpPassword1"}
                                    placeholder="Password"
                                    onChange={this.handleChange}
                                    value={this.state.signUpPassword1}
                                />
                                <input

                                    className="authbody form-control"
                                    type={"password"}
                                    name={"signUpPassword2"}
                                    placeholder="Confirm Password"
                                    onChange={this.handleChange}
                                    value={this.state.signUpPassword2}
                                />
                            </div>
                            <button type="submit" id="signupBtn" className="authbody">Sign Up</button>
                        </form>
                    </div>
                    <div className="authbody form-container sign-in-container">
                        <form method="get" id="loginForm" className="authbody" onSubmit={this.handleSubmit}>
                            <h1 className="authbody">Sign in</h1>
                            <span className="authbody">or use your account</span>
                            {
                                this.props.error === "Unable to log in with provided credentials."
                                    ?
                                <h1 className={'error'} style={{'color': 'red'}}>
                                    Invalid Username or Password
                                </h1>
                                    :
                                null
                            }
                            <input
                                className="authbody form-control"
                                type={"email"}
                                name={"loginEmail"}
                                placeholder="Email"
                                onChange={this.handleChange}
                                value={this.state.loginEmail}
                            />
                            <input
                                className="authbody form-control"
                                type={"password"}
                                name={"loginPassword"}
                                placeholder="Password"
                                onChange={this.handleChange}
                                value={this.state.loginPassword}
                            />
                            <a href="resetPassword" className="authbody">Forgot your password?</a>
                            <button type="submit" id="loginBtn" className="authbody">Sign In</button>
                        </form>
                    </div>
                    <div className="authbody overlay-container">
                        <div className="authbody overlay">
                            <div className="authbody overlay-panel overlay-left right-panel-active">
                                <h1 className="authbody">Welcome Back!</h1>
                                <p className="authbody">To keep connected with us please login with your personal info</p>
                                <button className="authbody ghost" id="signIn">Sign In</button>
                            </div>
                            <div className="authbody overlay-panel overlay-right">
                                <h1 className="authbody">Hello, Friend!</h1>
                                <p className="authbody">Enter your personal details and start journey with us</p>
                                <button className="authbody ghost" id="signUp">Sign Up</button>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="authbody">
                    <p className="authbody">
                        Template Created by
                        <a className="authbody" target="_blank" href="https://florin-pop.com" rel="noopener noreferrer">
                            Florin Pop
                        </a>
                        - Read how I created this and how you can join the challenge
                        <a className="authbody" target="_blank"
                           href="https://www.florin-pop.com/blog/2019/03/double-slider-sign-in-up-form/"
                            rel="noopener noreferrer">here
                        </a>.
                    </p>
                </footer>
            </span>
        )
    }
}

const mapStateToProps = state => {
    const stateError = state.error? state.error.toString().split(": ")[1]:state.error
    return {
        loading: state.loading,
        error: stateError
    }
}

const mapDispatchToProps = dispatch => {
    return{
        onAuth: (email, password) => dispatch(action.authLogin(email, password)),
        onRegister: (name, email, pass1, pass2) => dispatch(action.authSignup(name, email, pass1, pass2))
    }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Auth))