export function popup() {
  const width = 400
  const height = 600
  const left = window.screenX + (window.innerWidth - width) / 2
  const top = window.screenY + (window.innerHeight - height) / 2

  const popup = window.open(
    'https://google.com',
    'uauth:authorize:popup',
    `left=${left},top=${top},width=${width},height=${height},resizable,scrollbars=yes,status=1`,
  )

  if (!popup) {
    throw new Error('no popup')
  }

  popup.focus()
}

// function SetName() {
//   if (window.opener != null && !window.opener.closed) {
//       var txtItemID = window.opener.document.getElementById("txtItemID");
//       txtItemID.value = document.getElementById("txtItemName").value;
//   }
//   window.close();
// }
