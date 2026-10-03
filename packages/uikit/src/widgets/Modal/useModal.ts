import React, { useCallback, useContext, useEffect, useId } from "react";
import get from "lodash/get";
import { Context } from "./ModalContext";
import { Handler } from "./types";

const useModal = (
  modal: React.ReactNode,
  closeOnOverlayClick = true,
  updateOnPropsChange = false,
  modalId = "defaultNodeId"
): [Handler, Handler] => {
  // Logical names are shared by nested swap/fallback hooks. Only the instance
  // that presented a dialog may publish prop updates to it.
  const instanceId = useId();
  const ownerId = `${modalId}:${instanceId}`;
  const { isOpen, nodeId, modalNode, setModalNode, onPresent, onDismiss } = useContext(Context);
  const onPresentCallback = useCallback(() => {
    onPresent(modal, ownerId, closeOnOverlayClick);
  }, [modal, ownerId, onPresent, closeOnOverlayClick]);

  // Updates the "modal" component if props are changed
  // Use carefully since it might result in unnecessary rerenders
  // Typically if modal is static there is no need for updates, use when you expect props to change
  useEffect(() => {
    // Instance ownership also isolates two hooks with the same logical modalId.
    if (updateOnPropsChange && isOpen && nodeId === ownerId) {
      const modalProps = get(modal, "props");
      const oldModalProps = get(modalNode, "props");
      // Note: I tried to use lodash isEqual to compare props but it is giving false-negatives too easily
      // For example ConfirmSwapModal in exchange has ~500 lines prop object that stringifies to same string
      // and online diff checker says both objects are identical but lodash isEqual thinks they are different
      // Do not try to replace JSON.stringify with isEqual, high risk of infinite rerenders
      // TODO: Find a good way to handle modal updates, this whole flow is just backwards-compatible workaround,
      // would be great to simplify the logic here
      if (modalProps && oldModalProps && JSON.stringify(modalProps) !== JSON.stringify(oldModalProps)) {
        setModalNode(modal);
      }
    }
  }, [updateOnPropsChange, nodeId, ownerId, isOpen, modal, modalNode, setModalNode]);

  return [onPresentCallback, onDismiss];
};

export default useModal;
