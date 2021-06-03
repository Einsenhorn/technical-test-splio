import React from "react";

export interface CounterProps {
    defaultCounter: number;
}

export interface CounterState {
    counter: number;
}

class Counter extends React.Component<CounterProps, CounterState> {
    constructor(props: CounterProps) {
        super(props);
        this.state = { counter: props.defaultCounter || 0 };
    }

    incrementCounter(): void {
        this.setState({ counter: this.state.counter + 1 });
    }

    render() {
        return (
            <div>
                <h1>counter at: {this.state.counter}</h1>
                <button onClick={() => this.incrementCounter()}>button</button>
            </div>
        );
    }
}

export default Counter;
