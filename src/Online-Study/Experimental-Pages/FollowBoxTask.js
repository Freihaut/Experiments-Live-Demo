import React, { Component } from 'react';

import Timer from '../Layout-Components/Timer';
import '../Style-Sheets/MovingCircle.css';

import KeyboardMouseTracker from "../../General-Components/KeyboardMouseTracker";
import EndofPracticeModal from "../Layout-Components/EndofPracticeModal";

const taskContainerStyle = {
    height: "450px",
    width: "450px",
    border: "solid 3px black",
    borderRadius: "50%",
    marginTop: "30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
    // backgroundColor: "#4169E1"
};


export default class FollowBoxTask extends Component {

    constructor(props) {
        super(props);
        this.circleRef = React.createRef();
        this.state = {
            onObject: false,
            started: false,
            animProg: 0,
            modal: "modal is-active",
            startModal: "modal",
            practice: true,
            key: 0,
        };

        this.endTask = this.endTask.bind(this);
        this.initializeTask = this.initializeTask.bind(this);
        this.mouseInBox = this.mouseInBox.bind(this);
        this.initializePractice = this.initializePractice.bind(this);


    }

    componentDidMount() {

        window.scrollTo(0, 0);

        document.body.classList.add("is-clipped");

        // setup variable to store tracker data
        this.mouseKeyboardData = [];
        // get the start time of the component
        this.startTime = Date.now();

        // save the current box and mouse Position to be able to detect whether the mouse cursor is inside the target
        this.mousePosition = {
            x: 0,
            y: 0
        };

        // for debugging the firing rate of the requestanimationframe function
        // this.animTimes = [];

        this.lastTimestamp = 0;

        const phase = this.props.name.slice(0, 2);

        if (phase === "Co") {
            this.initializeTask();
        }
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.loop);
    }

    initializePractice() {

        document.body.classList.remove("is-clipped");
        this.setState({
            modal: "modal",
        }, function () {
            // starts checking whether the mouse is inside the box
            this.mouseInBox()
        });
    }

    initializeTask() {

        this.trialStartTime = Date.now();
        // reset everything back to start but without practice (set timer to 30 seconds)
        document.body.classList.remove("is-clipped");

        this.setState({
            modal: "modal",
            startModal: "modal",
            practice: false,
            started: false,
            onObject: false,
            key: this.state.key + 1,
            animProg: 0
        }, function () {
            // starts checking whether the mouse is inside the box
            this.mouseInBox()
        });
    }

    restart() {
        // reset everything back to the start
        document.body.classList.add("is-clipped");
        this.setState({
            modal: "modal is-active",
            startModal: "modal",
            onObject: false,
            started: false,
            key: 0,
            animProg: 0
        })

    }

    endPractice() {
        // console.log(this.animTimes);
        window.cancelAnimationFrame(this.loop);
        // this.animTimes = [];
        // end the practice task and reset the moving box to its initial position
        document.body.classList.add("is-clipped");
        this.setState({
            startModal: "modal is-active",
            key: this.state.key + 1,
            onObject: false,
            started: false,
            animProg: 0
        });
    }


    // check if the mouse cursor is inside the target box (every 16 ms)
    mouseInBox(timestamp) {

        // console.log(timestamp - lastTimestamp);
        let progressThisFrame = (timestamp - this.lastTimestamp) / 5000;

        // this.animTimes.push(timestamp - this.lastTimestamp);

        this.lastTimestamp = timestamp;

        if (!isNaN(progressThisFrame)) {

            //console.log("gets called");
            const boxPos = this.circleRef.current.getBoundingClientRect();
            const boxX = (boxPos.left + boxPos.right) / 2;
            const boxY = (boxPos.top + boxPos.bottom) / 2;

            // get the squared distance of the x-y mouse Position to the center x-y position of the target
            const distanceSquared = (this.mousePosition.x - boxX) ** 2 + (this.mousePosition.y - boxY) ** 2;

            // if the x-y coordinate is inside the target circle with a radius of box width = 50 / 2 = 25
            if (distanceSquared <= 625) {

                if (!this.state.started && this.state.modal === "modal" && this.state.startModal === "modal") {
                    // if the task hasnt started yet, start it
                    this.setState({
                        started: true,
                        onObject: true
                    });
                    // if the task has already started, mark that the mouse cursor is inside the target
                } else if (this.state.modal === "modal" && this.state.startModal === "modal") {
                    this.setState({
                        onObject: true,
                        animProg: this.state.animProg + progressThisFrame
                    })
                }
            } else {
                // if the x-y coordinate is outside of the circle
                if (!this.state.started) {
                    // if the task hasnt started yet
                    // mark that the mouse cursor is outside of the target
                    this.setState({
                        onObject: false
                    })
                } else {
                    // if the task has started
                    this.setState({
                        onObject: false,
                        animProg: this.state.animProg + progressThisFrame
                    })
                }
            }
        }

        // repeat this loop until the timer is over
        this.loop = window.requestAnimationFrame(this.mouseInBox);
    }

    endTask(){

        // console.log(this.animTimes);
        window.cancelAnimationFrame(this.loop);
        // this.animTimes = [];

        const data = {"taskLoaded": this.startTime, "trialStarted": this.trialStartTime, "taskEnded": Date.now(),
            "TrackerData": this.mouseKeyboardData};

        this.props.proceedPhase(this.props.name, data);
    }


    onKeyboardMouseEvent(datapoint) {

        // if its a mousemove parameter, update info about the x-& y-position of the cursor
        if (datapoint.eventType === "MousePositionChanged") {
            this.mousePosition.x = datapoint.x;
            this.mousePosition.y = datapoint.y;
        }

        // save mouse data and add page relevant info before pushing it into the data array
        // information about whether the task has started and if the mouse cursor is inside the box
        const pageInfo = {
            taskStarted: this.state.started,
            inBox: this.state.onObject,
            practice: this.state.practice
        };

        Object.assign(datapoint, pageInfo);
        this.mouseKeyboardData.push(datapoint);
    }

    renderInstructionModal(){
        return (
            <div className={this.state.modal} style={{textAlign: "left", fontSize: "18px"}}>
                <div className="modal-background">{null}</div>
                <div className="modal-content">
                    <header className="modal-card-head">
                        <p className="modal-card-title">{null}</p>
                    </header>
                    <section className="modal-card-body">
                        <div className="content">
                            <h3>Task "Follow-the-Circle"</h3><br/>
                            <p>
                                In this task you have to <strong>follow a moving circle with your mouse cursor</strong>.
                            </p>
                            <p>
                                <strong>Throughout the task, try to keep your mouse inside the moving circle.</strong> If your mouse pointer is inside the circle, the background color of the circle is <span style={{color:  "hsl(217, 71%, 53%)", fontWeight: "bold"}}>blue</span>. If your mouse pointer is outside the circle, the background color is <span style={{color:  "hsl(0, 0%, 50%)", fontWeight: "bold"}}>grey</span>.
                            </p>
                            <p>
                                The task starts as soon as you move your mouse cursor inside the circle and it ends when the time runs out.
                            </p>
                        </div>
                    </section>
                    <footer className="modal-card-foot">
                        <button className="button is-link" onClick={this.initializePractice}>Start practice task</button>
                    </footer>
                </div>
            </div>
        )
    }


    renderStartModal(){
        return(
            <EndofPracticeModal startModal={this.state.startModal} restart={() => this.restart()} initializeTask={this.initializeTask}/>
        )
    }


    render() {
        return(
            <div style={{ display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"}}>
                <KeyboardMouseTracker onEvent={this.onKeyboardMouseEvent.bind(this)}/>
                <p style={{
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    UserSelect: "none"
                }}>
                    <strong>Follow the circle with the mouse pointer</strong>
                </p>
                <p style={{
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    UserSelect: "none"
                }}>Task starts as soon as the mouse cursor is in the circle and ends after:&nbsp;
                    {this.state.practice ?
                        !this.state.started ? "10 seconds" : <Timer time={10} end={()=> this.endPractice()}/>
                        :
                        !this.state.started ? "25 seconds" : <Timer time={25} end={()=> this.endTask()}/>}
                   </p>
                <div style={taskContainerStyle}>
                    <div className="movingCircle"
                         ref={this.circleRef}
                         style={{backgroundColor: this.state.onObject ? "hsl(217, 71%, 53%)" : "hsl(0, 0%, 86%)",
                             transform: "rotate(" + (360 * this.state.animProg - 90).toString() + "deg) translateX(225px)"}}
                         key={this.state.key}
                    ></div>
                </div>
                {this.renderInstructionModal()}
                {this.renderStartModal()}
            </div>
        );
    }

}