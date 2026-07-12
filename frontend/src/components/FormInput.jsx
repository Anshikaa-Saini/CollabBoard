const FormInput = ({ label, id, error, ...rest }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input id={id} className="input-field" {...rest} />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

export default FormInput;
