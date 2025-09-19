import React from "react";
import "./style.css";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

const SuccessModal: React.FC = () => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="checkmark">
          <IoMdCheckmarkCircleOutline />
        </div>
        <h2>Cadastro concluído!</h2>
      </div>
    </div>
  );
};

export default SuccessModal;
