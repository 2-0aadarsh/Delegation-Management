import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = ({
  name,
  value,
  onChange,
  placeholder = "Password",
  required = false,
  minLength,
  disabled = false,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 pr-11 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
      />

      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        disabled={disabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;

