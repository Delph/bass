export class WireReader {
  private offset = 0;

  private constructor(private readonly bytes: Uint8Array) {}

  static fromBinary(bytes: Iterable<number>) {
    return new WireReader(toBytes(bytes));
  }

  static fromEncoded(id: string) {
    return new WireReader(decodeBase64Url(id));
  }

  get done() {
    return this.offset === this.bytes.length;
  }

  byte() {
    const byte = this.bytes[this.offset++];

    if (byte === undefined) throw new Error('Invalid wire ID: truncated data');

    return byte;
  }

  id() {
    const value = this.byte() * 256 + this.byte();

    if (value === 0) throw new Error('Invalid wire ID: zero ID');

    return value;
  }
}

export class WireWriter {
  private readonly bytes: number[] = [];

  private constructor() {}

  static create() {
    return new WireWriter();
  }

  byte(value: number) {
    if (!Number.isInteger(value) || value < 0 || value > 0xff)
      throw new Error(`Invalid wire ID byte: ${value}`);

    this.bytes.push(value);
  }

  id(value: number) {
    if (!Number.isInteger(value) || value <= 0 || value > 0xffff)
      throw new Error(`Invalid wire ID value: ${value}`);

    this.bytes.push(Math.floor(value / 256), value % 256);
  }

  toBinary() {
    return [...this.bytes];
  }

  toEncoded() {
    return encodeBase64Url(this.bytes);
  }
}

function toBytes(bytes: Iterable<number>) {
  const binary = [...bytes];

  for (const byte of binary) {
    if (!Number.isInteger(byte) || byte < 0 || byte > 0xff)
      throw new Error(`Invalid wire ID byte: ${byte}`);
  }

  return Uint8Array.from(binary);
}

function encodeBase64Url(bytes: number[]) {
  let binary = '';

  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

function decodeBase64Url(id: string) {
  if (!/^[A-Za-z0-9_-]*$/.test(id)) throw new Error(`Invalid wire ID: ${id}`);

  if (id.length % 4 === 1) throw new Error(`Invalid wire ID: ${id}`);

  const base64 = id.replaceAll('-', '+').replaceAll('_', '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return bytes;
}
