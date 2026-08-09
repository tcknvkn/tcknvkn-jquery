/**
 * tcknvkn-jquery birim testleri.
 * Oluşturulma tarihi: 2026-04-24
 * Lisans: MIT
 * Web sitesi: https://www.tcknvkn.com/kutuphaneler/jquery
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const attach = require('../src/index.js');
const {
  validateTckn,
  validateMultipleTckn,
  validateVkn,
  validateMultipleVkn,
} = require('../src/index.js');

/**
 * Testlerde kullanılacak minimal jQuery benzeri mock nesnesi oluşturur.
 * @returns {(input:any)=>any & {fn: object}}
 */
function createJQueryMock() {
  /**
   * Test wrapper sınıfı.
   * @param {any[]} elements
   */
  function Wrapper(elements) {
    this.elements = elements;
  }

  /**
   * Elemanlar üzerinde dolaşır.
   * @param {(index:number, element:any)=>void} callback
   * @returns {Wrapper}
   */
  Wrapper.prototype.each = function each(callback) {
    this.elements.forEach((element, index) => {
      callback.call(element, index, element);
    });
    return this;
  };

  /**
   * Alan değerini okur/yazar.
   * @param {string=} nextValue
   * @returns {string|Wrapper}
   */
  Wrapper.prototype.val = function val(nextValue) {
    if (typeof nextValue === 'undefined') {
      return this.elements[0]?.value ?? '';
    }

    this.elements.forEach((element) => {
      element.value = nextValue;
    });
    return this;
  };

  /**
   * data alanını okur/yazar.
   * @param {string} key
   * @param {any=} nextValue
   * @returns {any}
   */
  Wrapper.prototype.data = function data(key, nextValue) {
    const target = this.elements[0];
    if (!target.__data) {
      target.__data = {};
    }

    if (typeof nextValue === 'undefined') {
      return target.__data[key];
    }

    this.elements.forEach((element) => {
      if (!element.__data) {
        element.__data = {};
      }
      element.__data[key] = nextValue;
    });

    return this;
  };

  /**
   * jQuery seçici benzeri sarıcı fonksiyon.
   * @param {any} input
   * @returns {Wrapper}
   */
  function $(input) {
    if (input instanceof Wrapper) {
      return input;
    }
    if (Array.isArray(input)) {
      return new Wrapper(input);
    }
    return new Wrapper([input]);
  }

  $.fn = Wrapper.prototype;
  return $;
}

test('validateTckn geçerli değeri doğrular', () => {
  const result = validateTckn('10000000146');
  assert.equal(result.valid, true);
  assert.equal(result.value, '10000000146');
  assert.deepEqual(result.errors, []);
});

test('validateTckn formatlı girdiyi normalize eder', () => {
  const result = validateTckn('100-000 00146');
  assert.equal(result.valid, true);
  assert.equal(result.value, '10000000146');
});

test('validateTckn uzunluk hatasını yakalar', () => {
  const result = validateTckn('12345');
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('11 haneli olmalıdır.'));
});

test('validateTckn ilk hane sıfır olduğunda reddeder', () => {
  const result = validateTckn('01234567890');
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('İlk hane 0 olamaz.'));
});

test('validateTckn checksum ve örüntü hatalarını yakalar', () => {
  const wrong10 = validateTckn('10000000156');
  const wrong11 = validateTckn('10000000145');
  const repeated = validateTckn('11111111111');

  assert.equal(wrong10.valid, false);
  assert.ok(wrong10.errors.includes('10. hane kontrol hanesi hatalı.'));
  assert.equal(wrong11.valid, false);
  assert.ok(wrong11.errors.includes('11. hane kontrol hanesi hatalı.'));
  assert.equal(repeated.valid, false);
  assert.ok(repeated.errors.includes('Geçersiz örüntü: tüm haneler aynı.'));
});

test('validateMultipleTckn sırayı korur', () => {
  const results = validateMultipleTckn(['10000000146', '10000000145', '11111111111']);
  assert.equal(results.length, 3);
  assert.equal(results[0].valid, true);
  assert.equal(results[1].valid, false);
  assert.equal(results[2].valid, false);
});

test('validateMultipleTckn dizi olmayan girdide boş liste döner', () => {
  const results = validateMultipleTckn(null);
  assert.deepEqual(results, []);
});

test('validateVkn geçerli değeri doğrular', () => {
  const result = validateVkn('1000036109');
  assert.equal(result.valid, true);
  assert.equal(result.value, '1000036109');
  assert.deepEqual(result.errors, []);
});

test('validateVkn formatlı girdiyi normalize eder', () => {
  const result = validateVkn('100-003-6109');
  assert.equal(result.valid, true);
  assert.equal(result.value, '1000036109');
});

test('validateVkn uzunluk hatasını yakalar', () => {
  const result = validateVkn('123456789');
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ['10 haneli olmalıdır.']);
});

test('validateVkn checksum ve örüntü hatalarını yakalar', () => {
  const wrongChecksum = validateVkn('1000036108');
  const repeated = validateVkn('1111111111');

  assert.equal(wrongChecksum.valid, false);
  assert.ok(wrongChecksum.errors.includes('Son hane kontrol hanesi hatalı.'));
  assert.equal(repeated.valid, false);
  assert.ok(repeated.errors.includes('Geçersiz örüntü: tüm haneler aynı.'));
});

test('validateMultipleVkn sırayı korur', () => {
  const results = validateMultipleVkn(['1000036109', '1000036108', '1111111111']);
  assert.equal(results.length, 3);
  assert.equal(results[0].valid, true);
  assert.equal(results[1].valid, false);
  assert.equal(results[2].valid, false);
});

test('validateMultipleVkn dizi olmayan girdide boş liste döner', () => {
  const results = validateMultipleVkn(undefined);
  assert.deepEqual(results, []);
});

test('attach jQuery eklentilerini bağlar ve varsayılan data alanına sonucu yazar', () => {
  const $ = createJQueryMock();
  attach($);

  const tcknInput = { value: '10000000146' };
  const vknInput = { value: '1000036108' };

  $(tcknInput).tcknValidate();
  $(vknInput).vknValidate();

  assert.equal($(tcknInput).data('tcknResult').valid, true);
  assert.equal($(vknInput).data('vknResult').valid, false);
});

test('attach custom dataKey ile sonucu yazar', () => {
  const $ = createJQueryMock();
  attach($);

  const input = { value: '1000036109' };
  $(input).vknValidate({ dataKey: 'ozelVkn' });

  assert.equal($(input).data('ozelVkn').valid, true);
});

test('attach çekirdek API nesnesini jQuery üstüne ekler', () => {
  const $ = createJQueryMock();
  attach($);

  assert.equal(typeof $.tcknvkn.validateTckn, 'function');
  assert.equal(typeof $.tcknvkn.validateVkn, 'function');
});

test('attach geçersiz jQuery nesnesinde hata fırlatır', () => {
  assert.throws(() => attach(null), /Geçerli bir jQuery nesnesi verilmelidir/);
});
