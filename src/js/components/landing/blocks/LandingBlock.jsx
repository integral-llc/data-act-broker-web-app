/**
  * LandingBlock.jsx
  * Created by Kevin Li 5/17/16
  **/

import React from 'react';

const propTypes = {
	icon: React.PropTypes.element,
	text: React.PropTypes.string,
	buttonText: React.PropTypes.string,
	url: React.PropTypes.string,
	disabled: React.PropTypes.bool,
	comingSoon: React.PropTypes.string
};

const defaultProps = {
	text: '',
	buttonText: '',
	url: '#/',
	disabled: false,
	comingSoon: ''
};

export default class LandingBlock extends React.Component {
	render() {
		return (
			<div className="usa-da-landing-block-wrap col-md-4">
				<div className={"usa-da-landing-block " + this.props.comingSoon}>
					<div className="usa-da-landing-block-icon text-center">
						{this.props.icon}
					</div>
					<div className="usa-da-landing-block-text text-center">
						{this.props.text}
					</div>
					<div className="usa-da-landing-block-bottom">
						<div className="usa-da-landing-block-button">
							<a className="usa-da-button btn-primary btn-lg btn-full" href={this.props.url} disabled={this.props.disabled}>
								{this.props.buttonText}
							</a>
						</div>
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}

LandingBlock.propTypes = propTypes;
LandingBlock.defaultProps = defaultProps;