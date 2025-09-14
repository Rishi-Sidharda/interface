// StyledInput.jsx
export default function StyledInput({ prop, value, onChange }) {
  let inputClass = "bg-[#191919] text-white text-sm p-1";

  if (prop === "font-size" || prop === "height") {
    return (
      <div className="flex flex-col">
        <label className="text-fuchsia-300 font-bold mb-1">{prop}</label>
        <input
          className={inputClass}
          value={value}
          onChange={(e) => onChange(prop, e.target.value)}
        />
      </div>
    );
  }

  // default case
  return (
    <div className="flex flex-col">
      <label className="font-bold mb-1">{prop}</label>
      <input
        className={inputClass}
        value={value}
        onChange={(e) => onChange(prop, e.target.value)}
      />
    </div>
  );
}
