import React, { Fragment } from "react";
import "./App.css";
import Navbar from "./component/Navbar";
import Landing from "./component/Landing";
import Register from "./component/auth/register";
import Login from "./component/auth/login";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
const App = () => {
  return (
    <Router>
      <Fragment>
        <Navbar />
        <Route exact path="/" component={Landing} />
        <section className="container">
          <Switch>
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
          </Switch>
        </section>
      </Fragment>
    </Router>
  );
};

export default App;
