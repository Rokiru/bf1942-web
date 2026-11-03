/**
 * Read-only directory reader for Refractor2 FlatArchive (.rfa).
 * Fresh implementation based on public file layout descriptions; no game files included.
 */
const MARKER = 'Refractor2 FlatArchive 1.1  ';
const MAX_ENTRIES = 100000;
const MAX_PATH_BYTES = 8192;
const MAX_INDEX_BYTES = 64 * 1024 * 1024;
const MAX_PREVIEW = 512 * 1024;
const encoder = new TextDecoder('utf-8', {fatal:false});

export class RfaFormatError extends Error {
  constructor(message) { super(message); this.name = 'RfaFormatError'; }
}
const fail = message => { throw new RfaFormatError(message); };

class Cursor {
  constructor(file, pos = 0) { this.file = file; this.pos = pos; this.start = -1; this.bytes = new Uint8Array(0); }
  async read(n) {
    if (!Number.isSafeInteger(n) || n < 0 || this.pos + n > this.file.size) fail('Указатель за пределами архива');
    if (this.pos < this.start || this.pos + n > this.start + this.bytes.length) {
      const take = Math.min(this.file.size - this.pos, Math.max(128 * 1024, n));
      this.bytes = new Uint8Array(await this.file.slice(this.pos, this.pos + take).arrayBuffer());
      this.start = this.pos;
    }
    const at = this.pos - this.start;
    const part = this.bytes.subarray(at, at + n);
    this.pos += n;
    return part;
  }
  async u32() { const b = await this.read(4); return new DataView(b.buffer, b.byteOffset, b.byteLength).getUint32(0, true); }
}

export async function parseRFA(file) {
  if (!file || typeof file.slice !== 'function' || !Number.isSafeInteger(file.size)) fail('Нужен локальный файл .rfa');
  if (file.size < 36) fail('Файл слишком мал для RFA');
  const head = new Uint8Array(await file.slice(0, Math.min(file.size, 160)).arrayBuffer());
  const is11 = head.length >= 28 && encoder.decode(head.subarray(0, 28)) === MARKER;
  const base = is11 ? 28 : 0;
  const hd = new DataView(head.buffer, head.byteOffset, head.byteLength);
  const indexOffset = hd.getUint32(base, true);
  const compressionFlag = hd.getUint32(base + 4, true);
  const minHeader = is11 ? 36 : 156;
  if (file.size < minHeader) fail('Неполный заголовок RFA');
  if (compressionFlag !== 0 && compressionFlag !== 1) fail('Неизвестный флаг сжатия RFA');
  if (indexOffset < minHeader || indexOffset + 4 > file.size) fail('Некорректное смещение каталога RFA');
  const cursor = new Cursor(file, indexOffset);
  const count = await cursor.u32();
  if (count > MAX_ENTRIES) fail('Слишком много записей RFA (' + count + ')');
  const entries = [];
  const limit = Math.min(file.size, indexOffset + MAX_INDEX_BYTES);
  for (let i = 0; i < count; i++) {
    if (cursor.pos + 4 > limit) fail('Каталог RFA превышает допустимый размер');
    const pathLen = await cursor.u32();
    if (!pathLen || pathLen > MAX_PATH_BYTES || cursor.pos + pathLen + 24 > limit)
      fail('Некорректная длина имени записи №' + (i + 1));
    const path = encoder.decode(await cursor.read(pathLen));
    if (!path || path.includes('\0') || /[\u0000-\u001f]/.test(path)) fail('Некорректное имя записи №' + (i + 1));
    const compressedSize = await cursor.u32();
    const uncompressedSize = await cursor.u32();
    const dataOffset = await cursor.u32();
    await cursor.read(12);
    if (dataOffset > file.size || dataOffset + (compressionFlag ? 4 : uncompressedSize) > file.size)
      fail('Данные записи №' + (i + 1) + ' за пределами архива');
    entries.push({path, compressedSize, uncompressedSize, dataOffset});
  }
  return {version:is11?'1.1':'1.0',compressed:compressionFlag === 1,indexOffset,count,entries};
}

export async function previewTextEntry(file, archive, entry) {
  if (!archive || !entry || !archive.entries.includes(entry)) fail('Выберите запись архива');
  if (archive.compressed) fail('Для этого архива требуется декодер LZO1X; пока доступен только список файлов');
  if (!/\.(con|inc|txt|cfg)$/i.test(entry.path)) fail('Предпросмотр доступен только для текстовых файлов .con/.inc/.txt/.cfg');
  if (entry.uncompressedSize > MAX_PREVIEW) fail('Файл слишком большой для безопасного предпросмотра');
  if (entry.dataOffset + entry.uncompressedSize > file.size) fail('Файл выходит за пределы архива');
  return encoder.decode(await file.slice(entry.dataOffset, entry.dataOffset + entry.uncompressedSize).arrayBuffer());
}


const MAX_DECOMPRESSED_ENTRY = 64 * 1024 * 1024;
let lzoModulePromise;
async function getLzoDecoder() {
  if (!lzoModulePromise) {
    lzoModulePromise = import('https://cdn.jsdelivr.net/npm/lzo1x@1.0.1/+esm')
      .then(module => module.lzo1xDecompress ? module : module.default)
      .catch(() => { lzoModulePromise = null; throw new RfaFormatError('Не удалось загрузить LZO-декодер. Проверь интернет и повтори.'); });
  }
  return lzoModulePromise;
}

/** Read one entry's payload. Compressed RFA blocks store a 32-bit compressed length before LZO data. */
export async function readRfaEntry(file, archive, entry, maxOutput = MAX_DECOMPRESSED_ENTRY) {
  if (!archive || !entry || !archive.entries.includes(entry)) fail('Выберите запись архива');
  if (entry.uncompressedSize > maxOutput) fail('Файл превышает лимит распаковки (' + Math.round(maxOutput / 1048576) + ' МБ)');
  if (!archive.compressed) {
    if (entry.dataOffset + entry.uncompressedSize > file.size) fail('Файл выходит за пределы архива');
    return new Uint8Array(await file.slice(entry.dataOffset, entry.dataOffset + entry.uncompressedSize).arrayBuffer());
  }
  if (entry.dataOffset + 4 + entry.compressedSize > file.size) fail('Сжатый блок выходит за пределы архива');
  const prefix = new Uint8Array(await file.slice(entry.dataOffset, entry.dataOffset + 4).arrayBuffer());
  const storedLength = new DataView(prefix.buffer, prefix.byteOffset, 4).getUint32(0, true);
  const compressedLength = entry.compressedSize || storedLength;
  if (!compressedLength || compressedLength > file.size - entry.dataOffset - 4) fail('Некорректный размер LZO-блока');
  const input = new Uint8Array(await file.slice(entry.dataOffset + 4, entry.dataOffset + 4 + compressedLength).arrayBuffer());
  const decoder = await getLzoDecoder();
  let output;
  try { output = decoder.lzo1xDecompress(input, entry.uncompressedSize); }
  catch (error) { fail('LZO1X: распаковка не удалась (' + (error?.message || 'повреждённый блок') + ')'); }
  if (!(output instanceof Uint8Array) || output.length !== entry.uncompressedSize) fail('LZO1X: размер результата не совпадает с каталогом RFA');
  return output;
}

export async function previewTextEntry(file, archive, entry) {
  if (!/\\.(con|inc|txt|cfg|log|xml)$/i.test(entry.path)) fail('Предпросмотр доступен только для текстовых файлов');
  const bytes = await readRfaEntry(file, archive, entry, MAX_PREVIEW);
  return encoder.decode(bytes);
}
