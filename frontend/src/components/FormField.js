import {ExclamationCircleIcon} from "@heroicons/react/solid";
import {classNames} from "../utils/classNames";

export function FormField({ label, fieldName, fieldType, value, handleChange, errors, placeholder, touched }) {
  return (
    <div className={"py-2 mt-2"}>
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type={fieldType}
          name={fieldName}
          id={fieldName}
          className={classNames(
            errors && touched ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 text-gray-900 placeholder-gray-300 focus:ring-gray-500 focus:border-gray-500',
            'block w-full pr-10 focus:outline-none sm:text-sm rounded-md'
          )}
          placeholder={placeholder}
          aria-invalid={errors && touched ? "true" : "false"}
          aria-describedby={errors && touched ? `error-${label}` : label}
          onChange={handleChange}
          value={value}
        />
        {errors && touched && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true"/>
          </div>
        )}
      </div>
      {errors && touched && (
        <p className="mt-2 text-sm text-red-600" id={`error-${label}`}>
          {errors}
        </p>
      )}
    </div>
  )
}
