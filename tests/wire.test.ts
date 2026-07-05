import { describe, expect, test } from 'vitest';
import { WireReader, WireWriter } from '~/wire';

describe('wire', () => {
  test('writes bytes and two-byte IDs', () => {
    const writer = WireWriter.create();

    writer.byte(1);
    writer.id(1);
    writer.id(256);
    writer.id(65535);

    expect(writer.toBinary()).toStrictEqual([1, 0, 1, 1, 0, 255, 255]);
  });

  test('reads bytes and two-byte IDs', () => {
    const reader = WireReader.fromBinary([1, 0, 1, 1, 0, 255, 255]);

    expect(reader.byte()).toBe(1);
    expect(reader.id()).toBe(1);
    expect(reader.id()).toBe(256);
    expect(reader.id()).toBe(65535);
    expect(reader.done).toBe(true);
  });

  test('encodes and decodes URL-safe base64', () => {
    const writer = WireWriter.create();

    writer.byte(251);
    writer.byte(255);
    writer.byte(255);

    expect(writer.toEncoded()).toBe('-___');

    const reader = WireReader.fromEncoded(writer.toEncoded());

    expect(reader.byte()).toBe(251);
    expect(reader.byte()).toBe(255);
    expect(reader.byte()).toBe(255);
    expect(reader.done).toBe(true);
  });

  test('rejects invalid write values', () => {
    expect(() => WireWriter.create().byte(256)).toThrow('Invalid wire ID byte');
    expect(() => WireWriter.create().id(0)).toThrow('Invalid wire ID value');
    expect(() => WireWriter.create().id(65536)).toThrow(
      'Invalid wire ID value',
    );
  });

  test('rejects invalid read values', () => {
    expect(() => WireReader.fromBinary([1]).id()).toThrow(
      'Invalid wire ID: truncated data',
    );
    expect(() => WireReader.fromBinary([0, 0]).id()).toThrow(
      'Invalid wire ID: zero ID',
    );
    expect(() => WireReader.fromBinary([256])).toThrow('Invalid wire ID byte');
    expect(() => WireReader.fromEncoded('abc$')).toThrow('Invalid wire ID');
  });
});
