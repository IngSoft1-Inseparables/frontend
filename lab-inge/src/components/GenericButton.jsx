export default function GenericButton({ functionClick, nameButton, disabled, className = "", type }) {
  return (
    <button
      onClick={functionClick}
       type={type || "button"}
       disabled={disabled}
      className={`bg-gradient-to-r from-[#CA8747] to-[#A56A30] 
        text-[#FEFCFB] 
        border-none 
        rounded-lg 
        cursor-pointer 
        transition-filter duration-200 ease-in-out
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}`}
    >
      {nameButton}
    </button>
  );
}