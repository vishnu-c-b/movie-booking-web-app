import React from "react";
import reactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


import { Provider } from "react-redux";
import store from "./store/store";
import AutoLogin from "./components/auth/AutoLogin";

const root = reactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AutoLogin>
        <App />
      </AutoLogin>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
