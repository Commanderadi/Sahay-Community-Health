import { forwardRef, useId } from 'react';

export const Input = forwardRef(function Input(
  { label, error, hint, className = '', id, icon: Icon, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${Icon ? 'pl-9' : ''} ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : ''
          }`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, error, className = '', id, children, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id || autoId;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
        </label>
      )}
      <select ref={ref} id={selectId} className={`input pr-8 ${error ? 'border-red-400' : ''}`} {...props}>
        {children}
      </select>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});
