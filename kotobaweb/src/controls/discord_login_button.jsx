import React from 'react';

const styles = {
  button: {
    backgroundColor: '#2a2d32',
  },
  icon: {
    position: 'relative',
    top: '3px',
    fontSize: '135%',
    marginRight: '.6em',
  },
};

function Button() {
  return (
    <a type="button" className="btn btn-raised btn-primary" style={styles.button} href="/api/login">
      <i className="fab fa-discord" style={styles.icon} />
      <span>Login with Discord</span>
    </a>
  );
}

export default Button;
