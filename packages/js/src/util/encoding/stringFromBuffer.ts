const stringFromBuffer = (buf: ArrayBuffer): string =>
  String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)))

export default stringFromBuffer
