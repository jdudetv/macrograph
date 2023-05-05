/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";

const invoke = window.tau

render(() => <App />, document.getElementById("root") as HTMLElement);
