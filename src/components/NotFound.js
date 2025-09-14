import React from 'react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <img src="/assets/snowboarder.png" alt="Snowboarder going off trail" />
        <h2>Oops! You've gone off trail!<br />Maybe you should go back <a href="/">home</a>.</h2>
      </div>
    </div>
  );
};

export default NotFound;