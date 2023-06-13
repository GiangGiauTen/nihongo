// These rules, if followed, hurt readability.
/* eslint react/jsx-one-expression-per-line: 0 */
import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import 'bootstrap-material-design-icons/css/material-icons.css';
import './game.css';
import '../main.css';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
// import { useFlashcards } from './hooks/useFlashCard';
// import RightPanel from '../game_common/right_panel';
// import AnswerArea from '../game_common/answer_area';
// import EventBox from '../game_common/event_box';
// import ChooseUsernameModal from '../game_common/choose_username_modal';
// import Analytics from '../util/analytics';
// import NoSuchGameModal from '../game_common/no_such_game_modal';
// import createSocket from '../util/create_socket';
// const ANALYTICS_CATEGORY = 'flash card';

function Game() {
  const allCards = [
    {
      id: 1,
      front: 'Component',
      back: 'Conceptually, components are like JavaScript functions. They accept arbitrary inputs (called “props”) and return React elements describing what should appear on the screen.',
    },
    {
      id: 2,
      front: 'Props',
      back: 'When React sees an element representing a user-defined component, it passes JSX attributes and children to this component as a single object. We call this object “props”.',
    },
    {
      id: 3,
      front: 'Conditional Rendering',
      back: 'Conditional rendering in React works the same way conditions work in JavaScript. Use JavaScript operators like if or the conditional operator to create elements representing the current state, and let React update the UI to match them.',
    },
    {
      id: 4,
      front: 'Composition vs Inheritance',
      back: 'React has a powerful composition model, and we recommend using composition instead of inheritance to reuse code between components.',
    },
    {
      id: 5,
      front: 'State',
      back: 'React State can be thought of as a variable in which we store some data. We can tell React to re-render our view when these "state" variables change by using setState().',
    },
    {
      id: 6,
      front: 'Declarative Syntax',
      back: 'React uses Declarative Syntax which means that if we want something we just write it down instead of creting it from scratch. Eg: If we want a checkbox we might use something like <Checkbox />',
    },
    {
      id: 7,
      front: 'Library not a Framework',
      back: 'React JS is a library and not a framework. This means that we can import React.js in any of our html css js project.',
    },
    {
      id: 8,
      front: 'Everything is a Component',
      back: 'When using React everything is a component. That button, This page, That Navbar everything.',
    },
    {
      id: 9,
      front: 'React Hooks',
      back: 'React hooks are the functions which allows to use state, lifecycle methods and other react features. Hooks are not used inside class based component. Example: useState, useEffect, useMemo, useContext etc.',
    },
    {
      id: 10,
      front: 'React Lifecycle Methods',
      back: 'React Component has a lifecycle, which can be monitored and manipulated during its phases. The phases of lifecycle in React Component are: Mounting, Updating & Unmounting.',
    },
    {
      id: 11,
      front: 'Higher Order Components (HOC)',
      back: 'Higher order components is a advance technique in react. It is a function that takes a component and returns a new component. Example: withAuth(ProfilePage). Here withAuth is a HOC and ProfilePage is a component.',
    },
    {
      id: 12,
      front: 'Memoization in React',
      back: 'Memoization is a optimizaion technique in react. It helps to improve performance of application by preventing unnecessary re-renders and caching. React has in-build hooks useMemo() in order to implement memoization.',
    },
  ];
  const totalCards = allCards.length;
  const [curCardId, setCurCardId] = useState(1);

  function Card({ id, front, back }) {
    return (
      <div className="card-holder">
        <div className="card">
          <div className="front">
            <p>{id}</p>
            <p>{front}</p>
          </div>
          <div className="back">
            <p>{back}</p>
          </div>
        </div>
      </div>
    );
  }

  // const FlashcardList = ({ flashcards }) => (
  //   <div className="flashcard-list">
  //     {flashcards.map((flashcard) => (
  //       <Flashcard
  //         key={flashcard.id}
  //         question={flashcard.question}
  //         answer={flashcard.answer}
  //       />
  //     ))}
  //   </div>
  // );
  function isValidId(id) {
    return id <= totalCards && id >= 1;
  }

  const goToPrev = () => {
    if (isValidId(curCardId - 1)) {
      setCurCardId(curCardId - 1);
    } else {
      setCurCardId(totalCards);
    }
  };

  const goToNext = () => {
    if (isValidId(curCardId + 1)) {
      setCurCardId(curCardId + 1);
    } else {
      setCurCardId(1);
    }
  };
  return (
    <Container className="container-main">
      <Card {...allCards.find(item => item.id === curCardId)} />
      <div className="action-buttons">
        <Button
          variant="warning"
          className="me-4 prev-next-btns"
          onClick={goToPrev}
        >
          Prev
        </Button>
        <Button
          variant="success"
          className="ms-4 prev-next-btns"
          onClick={goToNext}
        >
          Next
        </Button>
      </div>
    </Container>
  );
}

export default withRouter(Game);
