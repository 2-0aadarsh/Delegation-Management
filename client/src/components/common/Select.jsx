import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

/**
 * Custom-styled Select (no 3rd party libs).
 * Controlled component:
 *  - value: currently selected option value
 *  - onChange: called with selected option value
 *
 * options: [{ value: string, label: string, subLabel?: string, disabled?: boolean }]
 */
const Select = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  width = "w-full",
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const selected = useMemo(
    () => options.find((o) => String(o.value) === String(value)),
    [options, value]
  );

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!rootRef.current) return;
      const target = e.target;
      const isInsideRoot = rootRef.current.contains(target);
      const isInsideMenu = menuRef.current ? menuRef.current.contains(target) : false;
      if (!isInsideRoot && !isInsideMenu) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const updateMenuPosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();
    const onScrollOrResize = () => updateMenuPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${width}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
        ref={buttonRef}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm border transition-colors
          ${
            disabled
              ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="min-w-0 text-left">
          <p className={`truncate ${selected ? "text-slate-800" : "text-slate-400"}`}>
            {selected?.label || placeholder}
          </p>
        </div>
        <ChevronDown size={16} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open && !disabled &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
            role="listbox"
            style={{
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange?.(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-3
                    ${opt.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50"}
                    ${isSelected ? "bg-indigo-50" : ""}`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{opt.label}</p>
                    {opt.subLabel && (
                      <p className="truncate text-xs text-slate-500 mt-0.5">{opt.subLabel}</p>
                    )}
                  </div>
                  {isSelected && <Check size={16} className="text-indigo-600" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Select;

