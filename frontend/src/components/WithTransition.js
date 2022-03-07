import React from "react";
import { Transition } from "react-transition-group";

const defaultStyle = {
  transition: `transform 200ms, opacity 200ms ease`,
  opacity: 1
};

const transitionStyles = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 }
};

export const WithTransition = ({ children, show }) => {
  return (
    <Transition
      in={show}
      timeout={{
        appear: 100,
        enter: 100,
        exit: 100
      }}
      appear
      unmountOnExit
    >
      {(state) => {
        return (
          <div
            style={{
              ...defaultStyle,
              ...transitionStyles[state]
            }}
          >
            {children}
          </div>
        );
      }}
    </Transition>
  );
};
