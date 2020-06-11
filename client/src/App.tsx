import React, { FC } from 'react'
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from "react-router-dom";
import Stream from './Stream';
import View from './View';

const App: FC = () => {
	return <Router>
		<Switch>
			<Route path="/stream/:streamId/:token">
				<Stream />
			</Route>
			<Route path="/view/:streamId">
				<View />
			</Route>
			<Route path="/">
				<div>Home</div>
				<Link to='/stream/1'>Stream</Link>
				<br />
				<Link to='/view/1'>View</Link>
			</Route>
		</Switch>
	</Router>
}

export default App