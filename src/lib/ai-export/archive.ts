import { Buffer } from "node:buffer";

interface ZipEntryInput {
  name: string;
  data: Uint8Array | string;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) !== 0 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
})();

const UTF8_FLAG = 0x0800;

function toUint8Array(data: Uint8Array | string) {
  return typeof data === "string" ? Buffer.from(data, "utf8") : data;
}

function writeUint16(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
}

function writeUint32(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;

  for (const value of data) {
    crc = CRC32_TABLE[(crc ^ value) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

export function createStoredZip(entries: ZipEntryInput[]) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const fileName = Buffer.from(entry.name, "utf8");
    const fileData = toUint8Array(entry.data);
    const checksum = crc32(fileData);

    const localHeader = new Uint8Array(30 + fileName.length);
    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, 20);
    writeUint16(localHeader, 6, UTF8_FLAG);
    writeUint16(localHeader, 8, 0);
    writeUint16(localHeader, 10, 0);
    writeUint16(localHeader, 12, 0);
    writeUint32(localHeader, 14, checksum);
    writeUint32(localHeader, 18, fileData.length);
    writeUint32(localHeader, 22, fileData.length);
    writeUint16(localHeader, 26, fileName.length);
    writeUint16(localHeader, 28, 0);
    localHeader.set(fileName, 30);

    localParts.push(localHeader, fileData);

    const centralHeader = new Uint8Array(46 + fileName.length);
    writeUint32(centralHeader, 0, 0x02014b50);
    writeUint16(centralHeader, 4, 20);
    writeUint16(centralHeader, 6, 20);
    writeUint16(centralHeader, 8, UTF8_FLAG);
    writeUint16(centralHeader, 10, 0);
    writeUint16(centralHeader, 12, 0);
    writeUint16(centralHeader, 14, 0);
    writeUint32(centralHeader, 16, checksum);
    writeUint32(centralHeader, 20, fileData.length);
    writeUint32(centralHeader, 24, fileData.length);
    writeUint16(centralHeader, 28, fileName.length);
    writeUint16(centralHeader, 30, 0);
    writeUint16(centralHeader, 32, 0);
    writeUint16(centralHeader, 34, 0);
    writeUint16(centralHeader, 36, 0);
    writeUint32(centralHeader, 38, 0);
    writeUint32(centralHeader, 42, offset);
    centralHeader.set(fileName, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + fileData.length;
  }

  const centralDirectorySize = centralParts.reduce(
    (total, part) => total + part.length,
    0,
  );

  const endRecord = new Uint8Array(22);
  writeUint32(endRecord, 0, 0x06054b50);
  writeUint16(endRecord, 4, 0);
  writeUint16(endRecord, 6, 0);
  writeUint16(endRecord, 8, entries.length);
  writeUint16(endRecord, 10, entries.length);
  writeUint32(endRecord, 12, centralDirectorySize);
  writeUint32(endRecord, 16, offset);
  writeUint16(endRecord, 20, 0);

  return Buffer.concat([
    ...localParts.map((part) => Buffer.from(part)),
    ...centralParts.map((part) => Buffer.from(part)),
    Buffer.from(endRecord),
  ]);
}
