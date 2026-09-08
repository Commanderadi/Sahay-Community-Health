import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

// Imperative confirm: const confirm = useConfirm(); await confirm({ title, ... })
// Returns a boolean. Replaces window.confirm with a styled, animated dialog.
export function useConfirm() {
  const [state, setState] = useState(null);

  const confirm = (opts) =>
    new Promise((resolve) => {
      setState({ ...opts, resolve });
    });

  const close = (result) => {
    state?.resolve(result);
    setState(null);
  };

  const element = (
    <Modal
      open={!!state}
      onClose={() => close(false)}
      title={state?.title || 'Are you sure?'}
      footer={
        <>
          <Button variant="secondary" onClick={() => close(false)}>
            {state?.cancelLabel || 'Cancel'}
          </Button>
          <Button
            variant={state?.destructive ? 'danger' : 'primary'}
            onClick={() => close(true)}
          >
            {state?.confirmLabel || 'Confirm'}
          </Button>
        </>
      }
    >
      {state?.message}
    </Modal>
  );

  return { confirm, element };
}
