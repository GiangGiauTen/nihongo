import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import defaultAvatar from '../img/discord_default_avatar.png';

const styles = {
  newQuizDeckIcon: {
    fontSize: '190%',
  },
  listDiv: {
    maxHeight: '400px',
    overflow: 'auto',
  },
  emptyIconDiv: {
    width: '24px',
    height: '24px',
  },
};

function getServerIcon(report, user) {
  let uri = report.discordServerIconUri;
  if (!uri && !report.discordServerName) {
    const avatarUri = user.discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${user.discordUser.id}/${user.discordUser.avatar}`
      : defaultAvatar;

    uri = avatarUri || defaultAvatar;
  }

  if (uri) {
    return <img src={uri} height="24" width="24" className="rounded-circle mr-3" alt="server icon" />;
  }

  return <div style={styles.emptyIconDiv} className="mr-3" />;
}

function createGameReportsBody(gameReports, gameReportsErrorMessage, user) {
  if (gameReportsErrorMessage) {
    return <span className="text-danger">Error retrieving game reports from server. Try refreshing or trying again later.</span>;
  }

  if (!gameReports) {
    return <span>Loading...</span>;
  }

  if (gameReports.length === 0) {
    return <span>No game reports. Try doing some quizzes on Discord.</span>;
  }

  return (
    <div style={styles.listDiv}>
      { gameReports.map(report => (
        <div className="py-1 d-flex justify-content-between align-items-center mr-2" key={report._id}>
          <div className="d-flex align-items-center">
            {getServerIcon(report, user)}
            <Link to={`/dashboard/game_reports/${report._id}`} style={styles.listAnchor}>{report.sessionName}</Link>
          </div>
          <span>{moment(report.startTime).format('MMMM Do, h:mm a')}</span>
        </div>
      )) }
    </div>
  );
}

function createCustomDecksBody(quizDecks, quizDecksErrorMessage) {
  if (quizDecksErrorMessage) {
    return <span className="text-danger">Error retrieving quiz decks from server. Try refreshing or trying again later.</span>;
  }

  if (!quizDecks) {
    return <span>Loading...</span>;
  }

  if (quizDecks.length === 0) {
    return (
      <div className="d-flex flex-column">
        <span>No custom quiz decks.</span>
        <Link to="/dashboard/decks/new" className="btn btn-outline-primary mt-4 d-flex justify-content-center align-items-center">
          <i className="material-icons mr-2" style={styles.newQuizDeckIcon}>add_box</i>
          {' '}
          Create new
        </Link>
      </div>
    );
  }

  const quizDecksSorted = quizDecks.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

  return (
    <>
      <div style={styles.listDiv}>
        { quizDecksSorted.map(deck => (
          <div className="py-1" key={deck._id}>
            <Link to={`/dashboard/decks/${deck._id}`} style={styles.listAnchor}>
              {deck.name}
              {' '}
              (
              {deck.shortName}
              )
            </Link>
          </div>
        )) }
      </div>
      <Link to="/dashboard/decks/new" className="btn btn-outline-primary mt-4 d-flex justify-content-center align-items-center">
        <i className="material-icons mr-2" style={styles.newQuizDeckIcon}>add_box</i>
        {' '}
        Create new
      </Link>
    </>
  );
}

class LoggedInMain extends Component {
  constructor() {
    super();
    this.state = {
      gameReports: undefined,
      quizDecks: undefined,
      gameReportsErrorMessage: '',
      quizDecksErrorMessage: '',
    };
  }

  componentWillMount() {
    axios.get('/api/users/me/game_reports').then((response) => {
      this.setState({
        gameReports: response.data,
        gameReportsErrorMessage: '',
      });
    }).catch((err) => {
      this.setState({
        gameReports: undefined,
        gameReportsErrorMessage: err.message,
      });
    });

    axios.get('/api/users/me/decks').then((response) => {
      this.setState({
        quizDecks: response.data,
        quizDecksErrorMessage: '',
      });
    }).catch((err) => {
      this.setState({
        quizDecks: undefined,
        quizDecksErrorMessage: err.message,
      });
    });
  }

  render() {
    return (
      <main className="container mt-5">
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-block-title">
                <h5 className="card-title">Session Reports</h5>
              </div>
              <div className="card-body">
                { createGameReportsBody(this.state.gameReports, this.state.gameReportsErrorMessage, this.props.user) }
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-block-title d-flex justify-content-between">
                <h5 className="card-title">Custom Quiz Decks</h5>
              </div>
              <div className="card-body">
                { createCustomDecksBody(this.state.quizDecks, this.state.quizDecksErrorMessage) }
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

export default LoggedInMain;
