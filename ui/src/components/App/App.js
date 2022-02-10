import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { Component } from 'react';
import lunr from 'lunr';
import Quiz from '../Quiz/Quiz';
import Recs from '../Recs/Recs';

const getHeader = () => (
  <header>
    <div className="wrapper header-container">
      <a href="/">
        <h1>
          <img
            width={200}
            src="/logo-dark-inline.png"
            alt="BoardGameRecs"
            className="logo-img"
          />
        </h1>
      </a>
      <div className="header-links">
        <a
          href="https://boardgamegeek.com/wiki/page/BGG_XML_API2"
          target="_blank"
          rel="noreferrer"
        >
          Data is sourced from BoardGameGeek API
        </a>
        <a
          href="https://www.github.com/cedricblondeau/board-game-recs"
          title="See on GitHub"
          target="_blank"
          rel="noreferrer"
        >
          See on GitHub
        </a>
      </div>
    </div>
  </header>
);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isError: false,
      isQuizScreen: true,
      likesSet: new Set(),
      gameIdToGameMap: null,
      gameSearchIndex: null,
      recsMap: null,
    };
  }

  async componentDidMount() {
    try {
      const gamesResponse = await fetch('/data/games.json');
      const gameIdToGameObject = await gamesResponse.json();

      const gameIdToGameMap = new Map(
        Object.entries(gameIdToGameObject).map((entry) => {
          const key = parseInt(entry[0], 10); // JS object properties are strings, transform to int
          const value = entry[1];
          return [key, value];
        })
      );

      const recsResponse = await fetch('/data/recs.json');
      const recsObject = await recsResponse.json();
      const recsMap = new Map(
        Object.entries(recsObject).map((entry) => {
          const key = parseInt(entry[0], 10); // JS object properties are strings, transform to int
          const value = entry[1];
          return [key, value];
        })
      );

      const gameSearchIndex = lunr(function () {
        this.ref('bgg_id');
        this.field('name');
        this.field('year');
        this.field('categories');
        gameIdToGameMap.forEach((doc) => this.add(doc));
      });

      this.setState({ gameIdToGameMap, recsMap, gameSearchIndex });
    } catch (e) {
      console.error(e);
      this.setState({ isError: true });
    }
  }

  render() {
    if (this.state.isError) {
      return (
        <div className="full-screen-message">
          Oh no! Something went wrong when loading data.
        </div>
      );
    }
    if (
      !this.state.gameIdToGameMap ||
      !this.state.recsMap ||
      !this.state.gameSearchIndex
    ) {
      return (
        <div className="full-screen-message">
          <div className="loading">
            <div className="loading__anim mb-1x">
              <div />
              <div />
              <div />
              <div />
            </div>
            <div className="loading__message">
              <span>Loading...</span>
            </div>
          </div>
        </div>
      );
    }
    if (this.state.isQuizScreen) {
      return (
        <div>
          {getHeader()}
          <Quiz
            gameIdToGameMap={this.state.gameIdToGameMap}
            gameSearchIndex={this.state.gameSearchIndex}
            likesSet={this.state.likesSet}
            onLike={(gameId) =>
              this.setState((prevState) => ({
                likesSet: prevState.likesSet.add(gameId),
              }))
            }
            onSubmit={() => this.setState({ isQuizScreen: false })}
            onUnlike={(gameId) => {
              this.state.likesSet.delete(gameId);
              this.setState((prevState) => ({
                likesSet: prevState.likesSet,
              }));
            }}
          />
        </div>
      );
    }
    return (
      <div>
        {getHeader()}
        <Recs
          gameIdToGameMap={this.state.gameIdToGameMap}
          likesSet={this.state.likesSet}
          recsMap={this.state.recsMap}
        />
      </div>
    );
  }
}

export default App;
