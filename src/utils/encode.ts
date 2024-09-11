function rot13(s: string) {
    return s.replace(/[A-Z]/gi, c =>
      "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm"[
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(c) ] )
  }

export default rot13