export default function GenericButton({ functionClick, nameButton, className = "" }) {
  return (
    <button
      onClick={functionClick}
      
      className={`bg-gradient-to-r from-[#CA8747] to-[#A56A30] 
        text-[#FEFCFB] 
        border-none 
        rounded-lg 
        cursor-pointer 
        transition-filter duration-200 ease-in-out
        ${className}`}
    >
      {nameButton}
    </button>
  );
}