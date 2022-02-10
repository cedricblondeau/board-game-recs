import React, { Component } from 'react';
import lunr from 'lunr';
import PropTypes from 'prop-types';

import './Quiz.css';

const MAX_GAMES = 50;

const getPopularGamesFromMap = (gameIdToGameMap) =>
  [...gameIdToGameMap.values()]
    .sort((a, b) => b.ratings_count - a.ratings_count)
    .slice(0, 100) // 100 most popular games
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort) // random sort the 100 most popular games
    .map(({ value }) => value)
    .slice(0, MAX_GAMES); // pick MAX_GAMES popular games
class Quiz extends Component {
  constructor(props) {
    super(props);
    this.searchTimeout = null;
    this.state = {
      popularGames: [],
      games: [],
    };
  }

  componentDidMount() {
    const popularGames = getPopularGamesFromMap(this.props.gameIdToGameMap);
    this.setState({
      popularGames,
      games: popularGames,
    });
  }

  componentWillUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  getGames() {
    if (this.state.games.length === 0) {
      return <div>No results.</div>;
    }

    const games = this.state.games.map((game) => {
      const isLiked = this.props.likesSet.has(game.bgg_id);
      const iconClassName = isLiked ? 'bi bi-heart-fill' : 'bi bi-heart';
      const overlayClassName = isLiked
        ? 'grid__item-like-overlay grid__item-like-overlay--liked'
        : 'grid__item-like-overlay';

      return (
        <div
          className="grid__item grid__item--likes"
          key={`game-${game.bgg_id}`}
        >
          <label htmlFor={`like-game-checkbox-${game.bgg_id}`}>
            <img
              className="grid__item-img"
              src={game.image_url}
              alt={game.name}
            />
            <div className={overlayClassName}>
              <i className={iconClassName} style={{ fontSize: 40 }} />
            </div>
          </label>

          <input
            id={`like-game-checkbox-${game.bgg_id}`}
            type="checkbox"
            value={game.bgg_id}
            checked={isLiked}
            onChange={({ target }) => {
              if (target.checked) {
                this.props.onLike(parseInt(target.value, 10)); // target.value is a str, we need a int
              } else {
                this.props.onUnlike(parseInt(target.value, 10));
              }
            }}
          />
        </div>
      );
    });

    return <div className="mb-1x grid">{games}</div>;
  }

  getButtonLabel() {
    if (this.props.likesSet.size === 0) {
      return 'Please pick at least 1 game';
    }
    if (this.props.likesSet.size === 1) {
      return 'Get recs for 1 game';
    }
    return `Get recs for ${this.props.likesSet.size} games`;
  }

  render() {
    return (
      <div>
        <div className="wrapper quiz mb-1x">
          <h2 className="mb-2x">Pick a few games you like to get started</h2>

          <div className="input-icon-container">
            <i className="bi bi-search" />
            <input
              className="input full-width mb-1x"
              type="text"
              placeholder="Game or category"
              onChange={async (event) => {
                const query = event.target.value;
                const delay = 300;

                if (this.searchTimeout != null) {
                  clearTimeout(this.searchTimeout);
                }

                if (query.length === 0) {
                  // reset to popular games if query is ""
                  this.setState((prevState) => ({
                    games: prevState.popularGames,
                  }));
                  return; // skip search if query is ""
                }

                this.searchTimeout = setTimeout(async () => {
                  const searchGames = await new Promise((resolve) => {
                    const searchResults = this.props.gameSearchIndex.search(
                      event.target.value
                    );

                    const games = searchResults
                      .map((searchResult) =>
                        this.props.gameIdToGameMap.get(
                          parseInt(searchResult.ref, 10)
                        )
                      )
                      .slice(0, MAX_GAMES);

                    resolve(games);
                  });

                  this.setState({
                    games: searchGames,
                  });
                }, delay);
              }}
            />
          </div>

          {this.getGames()}
        </div>

        <div className="quiz-btn-container">
          <button
            className="btn btn--primary"
            disabled={this.props.likesSet.size === 0}
            onClick={this.props.onSubmit}
            type="submit"
          >
            {this.getButtonLabel()}
          </button>
        </div>
      </div>
    );
  }
}

Quiz.propTypes = {
  gameIdToGameMap: PropTypes.instanceOf(Map).isRequired,
  gameSearchIndex: PropTypes.instanceOf(lunr.Index).isRequired,
  likesSet: PropTypes.instanceOf(Set).isRequired,
  onLike: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onUnlike: PropTypes.func.isRequired,
};

export default Quiz;
