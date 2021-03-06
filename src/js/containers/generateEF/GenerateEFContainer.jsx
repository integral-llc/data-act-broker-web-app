/**
* GenerateEFContainer.jsx
* Created by Kevin Li 8/23/16
**/

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';

import Q from 'q';

import * as uploadActions from '../../redux/actions/uploadActions.js';
import { kGlobalConstants } from '../../GlobalConstants.js';
import * as GenerateHelper from '../../helpers/generateFilesHelper.js';

import GenerateEFContent from '../../components/generateEF/GenerateEFContent.jsx';
import GenerateEFError from '../../components/generateEF/GenerateEFError.jsx';

const timerDuration = 10;

class GenerateEFContainer extends React.Component {
	constructor(props) {
		super(props);

		this.isUnmounted = false;

		this.state = {
			fullPageError: false,
			fullPageMessage: '',
			isReady: false,
			hasErrors: false,
			e: {},
			f: {}
		};

	}

	componentDidMount() {
		this.isUnmounted = false;
		this.generateFiles();
	}

	componentWillUnmount() {
		this.isUnmounted = true;
	}

	handleResponse(allResponses) {
		if (this.isUnmounted) {
			return;
		}

		const keys = ['e', 'f'];
		const newState = {};
		for (let i = 0; i < keys.length; i++) {
			const response = allResponses[i];
			let data;
			if (response.state == 'fulfilled') {
				data = response.value;

				if (data.status == 'invalid') {
					data.message = 'Prerequisites required to generate this file are incomplete.';
				}
			}
			else {
				data = response.reason;
			}

			newState[keys[i]] = data;
		}

		this.setState(newState, this.parseState);
	}

	generateFiles() {
		Q.allSettled([
			GenerateHelper.generateFile('E', this.props.submissionID, '', ''),
			GenerateHelper.generateFile('F', this.props.submissionID, '', '')
		])
		.then((allResponses) => {
			this.handleResponse(allResponses);
		});
	}

	checkFileStatus() {
		Q.allSettled([
			GenerateHelper.fetchFile('E', this.props.submissionID),
			GenerateHelper.fetchFile('F', this.props.submissionID)
		])
		.then((allResponses) => {
			this.handleResponse(allResponses);
		});
	}

	parseState() {
		const files = [this.state.e, this.state.f];
		let hasErrors = false;
		let isReady = true;
		let showFullPageError = false;
		let fullPageMessage = '';
		files.forEach((file) => {
			if (file.httpStatus == 403) {
				// permissions error, rejet
				showFullPageError = true;
				fullPageMessage = 'You do not have permission to view or modify this submission.';
			}
			else if (file.status == 'failed') {
				hasErrors = true;
			}
			else if (file.status == 'waiting') {
				isReady = false;
			}
			else if (file.status == 'invalid') {
				isReady = true;
				hasErrors = true;
			}
		});

		this.setState({
			fullPageError: showFullPageError,
			fullPageMessage: fullPageMessage,
			hasErrors: hasErrors,
			isReady: isReady
		});

		if (!isReady && !this.isUnmounted) {
			// files aren't ready yet, keep checking
			window.setTimeout(() => {
				this.checkFileStatus();
			}, timerDuration * 1000);
		}
	}

	nextPage() {
		hashHistory.push('/reviewData/' + this.props.submissionID);
	}

	render() {
		let content = <GenerateEFContent {...this.props} {...this.state} nextPage={this.nextPage.bind(this)} generateFiles={this.generateFiles.bind(this)} />;

		if (this.state.fullPageError) {
			content = <GenerateEFError message={this.state.fullPageMessage} />;
		}
		
		return (
			<div>
				{content}
			</div>
		)
	}
}

export default connect(
	state => ({ submission: state.submission }),
	dispatch => bindActionCreators(uploadActions, dispatch)
)(GenerateEFContainer)