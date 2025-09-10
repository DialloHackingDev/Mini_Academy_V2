import { useState } from "react";

export default function FormInput({ 
  label, 
  type = "text", 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error,
  className = "",
  ...props 
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          w-full px-3 py-2 border rounded-lg transition-colors duration-200
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
            : focused 
              ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-200' 
              : 'border-gray-300 hover:border-gray-400'
          }
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
