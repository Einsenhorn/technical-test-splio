import React from "react";
import ReactDOM from "react-dom";

import CounterComponent from "./counter";

export const Counter = CounterComponent;

if (typeof window !== "undefined") {
    ReactDOM.hydrate(
        <CounterComponent defaultCounter={0} />,
        document.getElementById("root")
    );
}
