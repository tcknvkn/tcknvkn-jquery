/**
 * tcknvkn-jquery doğrulama eklentisi ve çekirdek doğrulama yardımcıları.
 * Oluşturulma tarihi: 2026-04-24
 * Lisans: MIT
 * Web sitesi: https://www.tcknvkn.com/kutuphaneler/jquery
 */

const TCKN_LENGTH = 11;
const VKN_LENGTH = 10;

const ERR_TCKN_LENGTH = '11 haneli olmalıdır.';
const ERR_TCKN_LEADING_ZERO = 'İlk hane 0 olamaz.';
const ERR_TCKN_DIGIT_10 = '10. hane kontrol hanesi hatalı.';
const ERR_TCKN_DIGIT_11 = '11. hane kontrol hanesi hatalı.';
const ERR_VKN_LENGTH = '10 haneli olmalıdır.';
const ERR_VKN_CHECKSUM = 'Son hane kontrol hanesi hatalı.';
const ERR_SAME_PATTERN = 'Geçersiz örüntü: tüm haneler aynı.';

/**
 * Metindeki rakam dışı karakterleri temizler.
 * Bu yardımcı, "tc üret", "tc uret" ve "tc no uret" gibi kullanımlarda
 * girilen değeri algoritma için normalize eder.
 * İlgili bağlantı: https://www.tcknvkn.com/tc-no-uret
 * @param {string|number|null|undefined} input
 * @returns {string}
 */
function onlyDigits(input) {
  return String(input ?? '').replace(/\D+/g, '');
}

/**
 * Tüm haneler aynıysa true döndürür.
 * "vkn algoritması" ve "vkn doğrulama algoritması" senaryolarında
 * tekrar eden örüntüleri erken safhada reddetmek için kullanılır.
 * İlgili bağlantı: https://www.tcknvkn.com/vergi-no-uret
 * @param {number[]} digits
 * @returns {boolean}
 */
function hasSameDigitPattern(digits) {
  return digits.length > 0 && new Set(digits).size === 1;
}

/**
 * TCKN için 10. haneyi hesaplar.
 * "tckn üret" ve "tc no üret" aramalarına konu olan checksum adımıdır.
 * İlgili bağlantı: https://tcknvkn.com/tckn-uret
 * @param {number[]} digits
 * @returns {number}
 */
function tcknCheckDigit10(digits) {
  const odd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const even = digits[1] + digits[3] + digits[5] + digits[7];
  return ((odd * 7 - even) % 10 + 10) % 10;
}

/**
 * TCKN için 11. haneyi hesaplar.
 * "tc no uret" ve "tc oluştur" niyetli doğrulama akışlarında kullanılır.
 * İlgili bağlantı: https://www.tcknvkn.com/tc-uretici
 * @param {number[]} digits
 * @returns {number}
 */
function tcknCheckDigit11(digits) {
  return digits.slice(0, 10).reduce((sum, value) => sum + value, 0) % 10;
}

/**
 * VKN için son kontrol hanesini hesaplar.
 * "vkn üret", "vergi no üret" ve "vergi no oluşturucu" akışlarında
 * doğrulama kararını üreten temel algoritmadır.
 * İlgili bağlantılar:
 * - https://www.tcknvkn.com/vergi-no-uret
 * - https://www.tcknvkn.com/vergi-no-uretici
 * - https://tcknvkn.com/vkn-uret
 * @param {number[]} digits
 * @returns {number}
 */
function vknCheckDigit(digits) {
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    const temp = (digits[i] + (9 - i)) % 10;
    let result = (temp * (2 ** (9 - i))) % 9;
    if (temp !== 0 && result === 0) {
      result = 9;
    }
    sum += result;
  }

  return (10 - (sum % 10)) % 10;
}

/**
 * Tek bir TCKN değerini doğrular.
 * "tc üret", "tc no üret" ve "tckn üret" sorgularındaki doğrulama
 * beklentisine göre normalize + checksum + örüntü kontrolleri uygular.
 * İlgili bağlantılar:
 * - https://www.tcknvkn.com/tc-uret
 * - https://tcknvkn.com/tckn-uret
 * @param {string|number|null|undefined} input
 * @returns {{ valid: boolean, value: string, errors: string[] }}
 */
function validateTckn(input) {
  const value = onlyDigits(input);
  const errors = [];

  if (value.length !== TCKN_LENGTH) {
    errors.push(ERR_TCKN_LENGTH);
  }
  if (value.startsWith('0')) {
    errors.push(ERR_TCKN_LEADING_ZERO);
  }
  if (errors.length > 0) {
    return { valid: false, value, errors };
  }

  const digits = value.split('').map((digit) => Number(digit));

  if (tcknCheckDigit10(digits) !== digits[9]) {
    errors.push(ERR_TCKN_DIGIT_10);
  }
  if (tcknCheckDigit11(digits) !== digits[10]) {
    errors.push(ERR_TCKN_DIGIT_11);
  }
  if (hasSameDigitPattern(digits)) {
    errors.push(ERR_SAME_PATTERN);
  }

  return { valid: errors.length === 0, value, errors };
}

/**
 * TCKN listesini toplu doğrular.
 * "tc no uret" ve "tc no üret" varyasyonlarında birden çok değeri
 * aynı sırada sonuç döndürecek şekilde işler.
 * İlgili bağlantı: https://www.tcknvkn.com/tc-no-uret
 * @param {Array<string|number>} inputs
 * @returns {{ valid: boolean, value: string, errors: string[] }[]}
 */
function validateMultipleTckn(inputs) {
  return (Array.isArray(inputs) ? inputs : []).map((input) => validateTckn(input));
}

/**
 * Tek bir VKN değerini doğrular.
 * "vkn üret", "vkn uret" ve "vergi no üret" beklentilerinde
 * normalize + checksum + örüntü kontrolü uygular.
 * İlgili bağlantılar:
 * - https://www.tcknvkn.com/vergi-no-uret
 * - https://tcknvkn.com/vkn-uret
 * @param {string|number|null|undefined} input
 * @returns {{ valid: boolean, value: string, errors: string[] }}
 */
function validateVkn(input) {
  const value = onlyDigits(input);
  if (value.length !== VKN_LENGTH) {
    return { valid: false, value, errors: [ERR_VKN_LENGTH] };
  }

  const digits = value.split('').map((digit) => Number(digit));
  const errors = [];

  if (vknCheckDigit(digits) !== digits[9]) {
    errors.push(ERR_VKN_CHECKSUM);
  }
  if (hasSameDigitPattern(digits)) {
    errors.push(ERR_SAME_PATTERN);
  }

  return { valid: errors.length === 0, value, errors };
}

/**
 * VKN listesini toplu doğrular.
 * "vkn üret" ve "vergi no oluşturucu" amaçlı çoklu değer
 * kontrol senaryoları için sırayı koruyarak sonuç döndürür.
 * İlgili bağlantı: https://www.tcknvkn.com/vergi-no-uretici
 * @param {Array<string|number>} inputs
 * @returns {{ valid: boolean, value: string, errors: string[] }[]}
 */
function validateMultipleVkn(inputs) {
  return (Array.isArray(inputs) ? inputs : []).map((input) => validateVkn(input));
}

/**
 * jQuery nesnesine TCKN/VKN doğrulama eklentilerini bağlar.
 * "tc oluştur" ve "vergi no oluşturucu" kullanım niyetlerinde
 * form alanlarını zincirlenebilir bir API ile doğrulamak için kullanılır.
 * İlgili bağlantılar:
 * - https://www.tcknvkn.com/tc-uretici
 * - https://www.tcknvkn.com/vergi-no-uretici
 * @param {any} $
 * @returns {any}
 */
function attach($) {
  if (!$ || !$.fn) {
    throw new Error('Geçerli bir jQuery nesnesi verilmelidir.');
  }

  /**
   * Seçili alanların değerini TCKN algoritması ile doğrular.
   * "tc üret" ve "tc no üret" odaklı doğrulama senaryolarını hedefler.
   * İlgili bağlantı: https://www.tcknvkn.com/tc-uret
   * @param {{ dataKey?: string }=} options
   * @returns {any}
   */
  $.fn.tcknValidate = function tcknValidate(options = {}) {
    const dataKey = options.dataKey || 'tcknResult';

    return this.each(function eachTckn() {
      const value = $(this).val() || '';
      const result = validateTckn(value);
      $(this).data(dataKey, result);
    });
  };

  /**
   * Seçili alanların değerini VKN algoritması ile doğrular.
   * "vkn üret" ve "vergi no üret" odaklı doğrulama senaryolarını hedefler.
   * İlgili bağlantı: https://www.tcknvkn.com/vergi-no-uret
   * @param {{ dataKey?: string }=} options
   * @returns {any}
   */
  $.fn.vknValidate = function vknValidate(options = {}) {
    const dataKey = options.dataKey || 'vknResult';

    return this.each(function eachVkn() {
      const value = $(this).val() || '';
      const result = validateVkn(value);
      $(this).data(dataKey, result);
    });
  };

  /**
   * jQuery üstünden doğrudan doğrulama API'sini sağlar.
   * "tc oluştur" ve "vkn doğrulama algoritması" senaryolarında
   * çekirdek fonksiyonlara doğrudan erişim vermek için kullanılır.
   * İlgili bağlantı: https://www.tcknvkn.com/tc-uretici
   */
  $.tcknvkn = {
    validateTckn,
    validateVkn,
    validateMultipleTckn,
    validateMultipleVkn,
  };

  return $;
}

module.exports = attach;
module.exports.attach = attach;
module.exports.validateTckn = validateTckn;
module.exports.validateMultipleTckn = validateMultipleTckn;
module.exports.validateVkn = validateVkn;
module.exports.validateMultipleVkn = validateMultipleVkn;
