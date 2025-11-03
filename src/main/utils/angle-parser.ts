/**
 * Конвертация градусов в радианы
 */
export function degreesToRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Конвертация радианов в градусы
 */
export function radiansToDegrees(radians: number): number {
  return radians * 180 / Math.PI;
}

/**
 * Парсинг угла в формате DMS (градусы-минуты-секунды) в десятичные градусы
 * @param angleStr - строка с углом в формате DMS
 * @returns угол в десятичных градусах
 */
export function parseDMSAngle(angleStr: string): number {
  let cleaned = angleStr.replace(/[°'"]/g, '');
  cleaned = cleaned.replace(/\s+/g, '');

  if (cleaned.length < 5) {
    throw new Error('Неверный формат угла. Ожидается минимум 5 символов (DDDmm или DDDmmss)');
  }

  const degrees = parseInt(cleaned.substring(0, 3), 10); // первые 3 символа - градусы
  const minutes = parseInt(cleaned.substring(3, 5), 10);  // следующие 2 - минуты
  const seconds = cleaned.length >= 7 ? parseInt(cleaned.substring(5, 7), 10) : 0; // последние 2 - секунды

  if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
    throw new Error('Неверный формат угла. Используйте числа.');
  }
  
  if (minutes < 0 || minutes >= 60) {
    throw new Error('Минуты должны быть в диапазоне 0-59');
  }
  
  if (seconds < 0 || seconds >= 60) {
    throw new Error('Секунды должны быть в диапазоне 0-59');
  }
  
  // Конвертация в десятичные градусы
  const decimalDegrees = degrees + (minutes * 60 + seconds) / 3600;
  
  return decimalDegrees;
}

/**
 * Форматирование десятичных градусов в строку DMS
 * 
 * @param decimalDegrees - угол в десятичных градусах
 * @returns строка в формате "DDD°mm'ss""
 */
export function formatDMSAngle(decimalDegrees: number): string {
  const degrees = Math.floor(decimalDegrees);
  const minutesDecimal = (decimalDegrees - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);
  
  // Форматируем с ведущими нулями
  const degStr = String(degrees).padStart(3, '0');
  const minStr = String(minutes).padStart(2, '0');
  const secStr = String(seconds).padStart(2, '0');
  
  return `${degStr}°${minStr}'${secStr}"`;
}

/**
 * Попытка распарсить угол из строки
 * @param input - строка с углом
 * @returns угол в десятичных градусах или null если не удалось распарсить
 */
export function parseAngleFlexible(input: string): number | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const asNumber = parseFloat(trimmed);
  if (!isNaN(asNumber) && trimmed.match(/^-?\d+\.?\d*$/) && trimmed.length !== 7) {
    return asNumber;
  }

  try {
    return parseDMSAngle(trimmed);
  } catch (e) {
    return null;
  }
}

/**
 * Валидация строки угла
 * @param input - строка для проверки
 * @returns объект с результатом валидации
 */
export function validateAngleInput(input: string): {
  valid: boolean;
  value: number | null;
  error: string | null;
} {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { valid: false, value: null, error: 'Введите значение' };
  }
  
  const value = parseAngleFlexible(trimmed);
  
  if (value === null) {
    return {
      valid: false,
      value: null,
      error: 'Неверный формат. Используйте: 45.5 или 045°30\'15"'
    };
  }
  
  if (value < 0 || value > 360) {
    return {
      valid: false,
      value: null,
      error: 'Угол должен быть в диапазоне 0-360°'
    };
  }
  
  return { valid: true, value, error: null };
}



