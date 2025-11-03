import {
  degreesToRadians,
  radiansToDegrees,
  parseDMSAngle,
  formatDMSAngle,
  parseAngleFlexible,
  validateAngleInput
} from './angle-parser';

describe('angle-parser', () => {
  describe('degreesToRadians', () => {
    it('should convert degrees to radians', () => {
      expect(degreesToRadians(0)).toBe(0);
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
      expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI);
    });
  });

  describe('radiansToDegrees', () => {
    it('should convert radians to degrees', () => {
      expect(radiansToDegrees(0)).toBe(0);
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
      expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360);
    });
  });

  describe('parseDMSAngle', () => {
    it('should parse DMS format DDDmmss', () => {
      // 45°30'15" = 45 + 30/60 + 15/3600 = 45.504166...
      const result = parseDMSAngle('0453015');
      expect(result).toBeCloseTo(45.504166667, 5);
    });

    it('should parse DMS format with spaces', () => {
      const result = parseDMSAngle('045 30 15');
      expect(result).toBeCloseTo(45.504166667, 5);
    });

    it('should parse DMS format with symbols', () => {
      const result = parseDMSAngle("045°30'15\"");
      expect(result).toBeCloseTo(45.504166667, 5);
    });

    it('should parse zero angle', () => {
      expect(parseDMSAngle('0000000')).toBe(0);
      expect(parseDMSAngle('000 00 00')).toBe(0);
    });

    it('should parse 90 degrees', () => {
      expect(parseDMSAngle('0900000')).toBe(90);
    });

    it('should parse without seconds', () => {
      const result = parseDMSAngle('04530');
      expect(result).toBeCloseTo(45.5, 5);
    });

    it('should throw error on invalid format', () => {
      expect(() => parseDMSAngle('abc')).toThrow();
      expect(() => parseDMSAngle('12')).toThrow();
    });

    it('should throw error on invalid minutes', () => {
      expect(() => parseDMSAngle('0456000')).toThrow('Минуты должны быть в диапазоне 0-59');
    });

    it('should throw error on invalid seconds', () => {
      expect(() => parseDMSAngle('0453060')).toThrow('Секунды должны быть в диапазоне 0-59');
    });
  });

  describe('formatDMSAngle', () => {
    it('should format decimal degrees to DMS', () => {
      expect(formatDMSAngle(45.504166667)).toBe("045°30'15\"");
      expect(formatDMSAngle(0)).toBe("000°00'00\"");
      expect(formatDMSAngle(90)).toBe("090°00'00\"");
    });

    it('should handle fractional seconds with rounding', () => {
      const result = formatDMSAngle(45.5042);
      expect(result).toMatch(/045°30'15"/);
    });
  });

  describe('parseAngleFlexible', () => {
    it('should parse decimal degrees', () => {
      expect(parseAngleFlexible('45.5')).toBe(45.5);
      expect(parseAngleFlexible('90')).toBe(90);
      expect(parseAngleFlexible('0')).toBe(0);
    });

    it('should parse DMS format', () => {
      const result = parseAngleFlexible('0453015');
      expect(result).toBeCloseTo(45.504166667, 5);
    });

    it('should return null for empty string', () => {
      expect(parseAngleFlexible('')).toBeNull();
      expect(parseAngleFlexible('   ')).toBeNull();
    });

    it('should return null for invalid input', () => {
      expect(parseAngleFlexible('abc')).toBeNull();
      expect(parseAngleFlexible('12x')).toBeNull();
    });
  });

  describe('validateAngleInput', () => {
    it('should validate valid decimal input', () => {
      const result = validateAngleInput('45.5');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(45.5);
      expect(result.error).toBeNull();
    });

    it('should validate valid DMS input', () => {
      const result = validateAngleInput('0453015');
      expect(result.valid).toBe(true);
      expect(result.value).toBeCloseTo(45.504166667, 5);
      expect(result.error).toBeNull();
    });

    it('should reject empty input', () => {
      const result = validateAngleInput('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Введите значение');
    });

    it('should reject invalid format', () => {
      const result = validateAngleInput('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Неверный формат');
    });

    it('should reject out of range values', () => {
      const result1 = validateAngleInput('-10');
      expect(result1.valid).toBe(false);
      expect(result1.error).toContain('диапазоне 0-360');

      const result2 = validateAngleInput('400');
      expect(result2.valid).toBe(false);
      expect(result2.error).toContain('диапазоне 0-360');
    });

    it('should validate edge cases', () => {
      const result1 = validateAngleInput('0');
      expect(result1.valid).toBe(true);
      expect(result1.value).toBe(0);

      const result2 = validateAngleInput('360');
      expect(result2.valid).toBe(true);
      expect(result2.value).toBe(360);
    });
  });
});



