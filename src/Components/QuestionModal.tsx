import type { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function QuestionModal({ isOpen, onClose, children }: Props) {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button style={closeBtn} onClick={onClose}>✖</button>
        {children}
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  width: "90%",
  maxWidth: 420,
  boxShadow: "0 8px 20px rgba(0,0,0,0.3)"
};

const closeBtn: React.CSSProperties = {
  background: "crimson",
  border: "none",
  color: "white",
  padding: "5px 10px",
  borderRadius: 6,
  cursor: "pointer",
  float: "right"
};
