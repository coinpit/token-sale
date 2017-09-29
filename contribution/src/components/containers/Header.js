import React, { PureComponent }     from 'react';
import Supply                   from '../header/Supply';
import Countdown                from '../header/Countdown';
import Register                 from '../header/Register';
import LandingVideo             from '../utils/LandingVideo';

export default class Header extends PureComponent {
    render(){
        return(
            <section id="header">
                <div className="container">
                    <div className="row pv-40">
                        <div className="col-md-7">
                            <LandingVideo />
                        </div>
                        <div className="col-md-5">
                            <Supply />
                        </div>
                    </div>
                    <div className="row pb-40">
                        <div className="col-md-7">
                            <Countdown  history={this.props.history} />
                        </div>
                        <div className="col-md-5">
                            <Register   history={this.props.history} />
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}