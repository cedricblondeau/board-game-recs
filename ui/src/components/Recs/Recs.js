import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Recs extends Component {
  getRecsPerLikeGame() {
    const likesCount = this.props.likesSet.size;
    if (likesCount < 2) {
      return 15;
    }
    if (likesCount < 3) {
      return 10;
    }
    return 5;
  }

  render() {
    const seenRecIds = new Set();
    const recs = [...this.props.likesSet].map((likedGameId) => {
      if (!this.props.recsMap.has(likedGameId)) {
        return null;
      }

      if (!this.props.gameIdToGameMap.has(likedGameId)) {
        console.warn(`Liked game #${likedGameId} is not in the the games map`);
        return null;
      }
      const likedGame = this.props.gameIdToGameMap.get(likedGameId);

      const recsForLikeGameId = this.props.recsMap
        .get(likedGameId)
        .filter((recGameId) => !this.props.likesSet.has(recGameId))
        .filter((recGameId) => !seenRecIds.has(recGameId))
        .slice(0, this.getRecsPerLikeGame());

      if (recsForLikeGameId.length === 0) {
        return null;
      }

      recsForLikeGameId.forEach((recGameId) => {
        seenRecIds.add(recGameId);
      });

      const recGames = recsForLikeGameId.map((recGameId) => {
        if (!this.props.gameIdToGameMap.has(recGameId)) {
          console.warn(
            `Recommended game #${recGameId} is not in the the games map`
          );
          return null;
        }

        const game = this.props.gameIdToGameMap.get(recGameId);

        return (
          <div
            className="grid__item grid__item--link"
            key={`game-${game.bgg_id}`}
          >
            <a
              href={`https://boardgamegeek.com/boardgame/${game.bgg_id}`}
              target="_blank"
              rel="noreferrer"
              title="Open in BoardGameGeek"
            >
              <img
                className="grid__item-img"
                width={200}
                src={game.image_url}
                alt={game.name}
              />
            </a>
          </div>
        );
      });

      return (
        <div className="mb-3x" key={`recs-game-${likedGame.bgg_id}`}>
          <h3 className="mb-1x">Because you like {likedGame.name}</h3>

          <div className="grid">{recGames}</div>
        </div>
      );
    });

    return (
      <div className="wrapper">
        <div className="pb-1x">{recs}</div>
      </div>
    );
  }
}

Recs.propTypes = {
  gameIdToGameMap: PropTypes.instanceOf(Map).isRequired,
  likesSet: PropTypes.instanceOf(Set).isRequired,
  recsMap: PropTypes.instanceOf(Map).isRequired,
};

export default Recs;
