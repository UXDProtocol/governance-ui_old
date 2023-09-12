import Modal from '@components/Modal';
import ModalHeader from './ModalHeader';

const DepositModal = ({
  onClose,
  isOpen,
  apy,
  protocolName,
  protocolLogoSrc,
  handledTokenName,
  strategyName,
}) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalHeader
        apy={apy}
        protocolLogoURI={protocolLogoSrc}
        protocolName={protocolName}
        TokenName={handledTokenName}
        strategy={strategyName}
      />
    </Modal>
  );
};

export default DepositModal;
