import React, { Fragment } from "react";
import "./App.css";
import Navbar from "./component/Navbar";
import Landing from "./component/Landing";
const App = () => {
  return (
    <Fragment>
      <Navbar />
      <Landing />
    </Fragment>
  );
};

export default App;
