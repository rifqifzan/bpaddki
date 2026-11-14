import {
  normalizeEmail,
  normalizeKode,
  normalizeNopol,
  trimNullableString,
} from './normalize.util.js';

describe('normalize.util', () => {
  describe('normalizeNopol', () => {
    it('menormalisasi nopol tanpa spasi', () => {
      expect(normalizeNopol('b1234xyz')).toBe('B 1234 XYZ');
    });

    it('menormalisasi nopol dengan titik dan spasi berlebih', () => {
      expect(normalizeNopol('  ab 1234 cd  ')).toBe('AB 1234 CD');
      expect(normalizeNopol('B.1234.XYZ')).toBe('B 1234 XYZ');
    });

    it('mempertahankan nilai yang tidak valid agar ditolak validasi', () => {
      expect(normalizeNopol('XYZ')).toBe('XYZ');
    });
  });

  it('menormalisasi kode dan email', () => {
    expect(normalizeKode('  disdik ')).toBe('DISDIK');
    expect(normalizeEmail(' Budi@Example.GO.ID ')).toBe('budi@example.go.id');
  });

  it('mengubah string kosong menjadi null', () => {
    expect(trimNullableString('   ')).toBeNull();
    expect(trimNullableString(null)).toBeNull();
    expect(trimNullableString('  isi  ')).toBe('isi');
  });
});
