export function showMessage(text, type = "info") {
  const banner = document.getElementById("appMessage");
  if (!banner) return;

  if (!text) {
    banner.textContent = "";
    banner.style.display = "none";
    banner.className = "app-message";
    return;
  }

  banner.textContent = text;
  banner.className = `app-message ${type}`;
  banner.style.display = "block";
}

export function clearMessage() {
  showMessage("");
}

export function showConfirmation({ title = "Confirmation", message = "Confirmer cette action ?", confirmText = "Confirmer", cancelText = "Annuler" } = {}) {
  const dialog = document.getElementById("confirmationDialog");
  if (!dialog) return Promise.resolve(false);

  dialog.setAttribute("aria-hidden", "false");
  dialog.classList.add("visible");

  const titleElement = dialog.querySelector("#dialogTitle");
  const messageElement = dialog.querySelector("#dialogMessage");
  const confirmButton = dialog.querySelector("#dialogConfirm");
  const cancelButton = dialog.querySelector("#dialogCancel");

  titleElement.textContent = title;
  messageElement.textContent = message;
  confirmButton.textContent = confirmText;
  cancelButton.textContent = cancelText;

  return new Promise(resolve => {
    const closeDialog = result => {
      dialog.classList.remove("visible");
      dialog.setAttribute("aria-hidden", "true");
      confirmButton.removeEventListener("click", onConfirm);
      cancelButton.removeEventListener("click", onCancel);
      dialog.removeEventListener("click", onOverlayClick);
      resolve(result);
    };

    const onConfirm = () => closeDialog(true);
    const onCancel = () => closeDialog(false);
    const onOverlayClick = event => {
      if (event.target === dialog) {
        closeDialog(false);
      }
    };

    confirmButton.addEventListener("click", onConfirm);
    cancelButton.addEventListener("click", onCancel);
    dialog.addEventListener("click", onOverlayClick);
  });
}
