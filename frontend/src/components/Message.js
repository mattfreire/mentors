import React, {useState} from "react";
import {WithTransition} from "./WithTransition";
import {CheckCircleIcon, ExclamationIcon, InformationCircleIcon, XCircleIcon, XIcon} from "@heroicons/react/solid";

const MESSAGE_TYPES = {
  ERROR: "ERROR",
  WARNING: "WARNING",
  INFO: "INFO",
  SUCCESS: "SUCCESS"
};

const MESSAGE_THEME = {
  [MESSAGE_TYPES.ERROR]: {
    bodyBackground: "bg-red-100",
    bodyText: "text-red-700",
    headerText: "text-red-800",
    iconColour: "text-red-400"
  },
  [MESSAGE_TYPES.WARNING]: {
    bodyBackground: "bg-yellow-100",
    bodyText: "text-yellow-700",
    headerText: "text-yellow-800",
    iconColour: "text-yellow-400"
  },
  [MESSAGE_TYPES.INFO]: {
    bodyBackground: "bg-blue-100",
    bodyText: "text-blue-700",
    headerText: "text-blue-800",
    iconColour: "text-blue-400"
  },
  [MESSAGE_TYPES.SUCCESS]: {
    bodyBackground: "bg-green-100",
    bodyText: "text-green-700",
    headerText: "text-green-800",
    iconColour: "text-green-400"
  }
};

export function Message({ body, type, onDismiss, noDismiss = false }) {
  const theme = MESSAGE_THEME[type];
  const [show, toggle] = useState(true)
  return (
    <WithTransition show={show}>
      <div className={`rounded-md ${theme.bodyBackground} p-4 mb-3`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {type === "ERROR" && <XCircleIcon className={`h-5 w-5 ${theme.iconColour}`} />}
            {type === "SUCCESS" && <CheckCircleIcon className={`h-5 w-5 ${theme.iconColour}`} />}
            {type === "INFO" && <InformationCircleIcon className={`h-5 w-5 ${theme.iconColour}`} />}
            {type === "WARNING" && <ExclamationIcon className={`h-5 w-5 ${theme.iconColour}`} />}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${theme.bodyText}`}>{body}</p>
          </div>
          {!noDismiss && (
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => {
                    toggle(false)
                    onDismiss()
                  }}
                  className={`inline-flex ${theme.bodyBackground} rounded-md p-1.5 ${theme.bodyText}`}
                >
                  <span className="sr-only">Dismiss</span>
                  <XIcon className={`h-5 w-5 ${theme.iconColour}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </WithTransition>
  );
}

Message.defaultProps = {
  onDismiss: () => null,
  noDismiss: false
};
