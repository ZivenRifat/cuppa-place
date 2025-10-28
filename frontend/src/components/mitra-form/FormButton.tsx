interface Props {
  label: string;
  onClick: () => void;
  secondary?: boolean;
}

export default function FormButton({ label, onClick, secondary }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[130px] h-11 px-6 rounded-md font-semibold transition text-sm md:text-base ${
        secondary
          ? "bg-gray-200 text-[#271F01] hover:bg-gray-300"
          : "bg-[#271F01] text-white hover:bg-[#3b2f00]"
      }`}
    >
      {label}
    </button>
  );
}
