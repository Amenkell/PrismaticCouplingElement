import {PrismInputParams, PrismOutputResult} from "../models/prism.interface";

/**
 * Гамма-функция (приближение Ланцоша)
 */
function gammaFunction(z: number): number {
  const g = 7;
  const C = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];

  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gammaFunction(1 - z));
  }

  z -= 1;
  let x = C[0];
  for (let i = 1; i < g + 2; i++) {
    x += C[i] / (z + i);
  }

  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/**
 * Функция профиля (Prof) - вычисляет глубину z по нормализованной координате b
 */
function calculateProfile(
  b: number | number[],
  alpha: number,
  AB: [number, number],
  e: [number, number, number]
): number | number[] {
  const isArray = Array.isArray(b);
  const bArray = isArray ? b : [b];
  
  // Корректируем alpha для устойчивости около 0.5 и ограничиваем диапазон
  const epsilonAlpha = 1e-4;
  let correctedAlpha = alpha;
  if (Math.abs(alpha - 0.5) < epsilonAlpha) correctedAlpha = 0.5 + epsilonAlpha;
  if (correctedAlpha < 0.2) correctedAlpha = 0.2;
  if (correctedAlpha > 20) correctedAlpha = 20;
  
  const s1 = AB[0] * correctedAlpha * gammaFunction(correctedAlpha) / 
             (gammaFunction(correctedAlpha + 0.5) * Math.sqrt(Math.PI));
  
  const result = bArray.map(bi => {
    if (bi <= 0 || bi > 1) {
      return NaN;
    }
    
    const safeBi = Math.max(bi, 1e-12);
    const denomE = e[0] - e[1];
    if (denomE <= 0) return NaN;
    const term1 = s1 * Math.pow(1 - safeBi, correctedAlpha - 0.5);
    const term2 = AB[1] * Math.log(safeBi) / 4;
    const numerator = term1 - term2;
    const value = numerator / Math.sqrt(denomE);
    
    // Фильтруем отрицательные значения z - физически глубина не может быть отрицательной
    if (value < 0) {
      return 0;
    }
    
    return value;
  });
  
  return isArray ? result : result[0];
}

/**
 * Вычисление функции F для аппроксимации
 */
function calculateF(b: number[], b1: number[]): number[] {
  return b.map((bi, i) => {
    const b1i = b1[i];
    const sqrtB1 = Math.sqrt(b1i);
    const sqrtB = Math.sqrt(bi);
    return sqrtB1 - sqrtB * Math.atan(Math.sqrt(b1i / bi));
  });
}

/**
 * Решение нелинейного уравнения методом Ньютона (fzero аналог)
 */
function fzero(
  func: (x: number) => number,
  x0: number,
  tolerance: number = 1e-6,
  maxIterations: number = 100
): number {
  let x = x0;
  let xPrev = x0 + 1e-2; // небольшое смещение для секущей
  let fxPrev = func(xPrev);
  const h = 1e-8;
  const maxStep = 1.0; // ограничение шага

  for (let iter = 0; iter < maxIterations; iter++) {
    const fx = func(x);
    if (!isFinite(fx)) {
      // если функция разошлась, возвращаемся к предыдущему
      return xPrev;
    }
    if (Math.abs(fx) < tolerance) {
      return x;
    }

    // Численная производная
    const fxh = func(x + h);
    let derivative = (fxh - fx) / h;

    let step: number;
    if (!isFinite(derivative) || Math.abs(derivative) < 1e-12) {
      // fallback на метод секущих
      const denom = fx - fxPrev;
      if (Math.abs(denom) < 1e-16) {
        // минимальный безопасный шаг
        step = Math.sign(fx || 1) * 1e-3;
      } else {
        step = (x - xPrev) * fx / denom;
      }
    } else {
      step = fx / derivative;
    }

    // демпфирование шага
    step = Math.max(-maxStep, Math.min(maxStep, step));
    const xNext = x - step;

    xPrev = x;
    fxPrev = fx;
    x = xNext;
  }

  return x;
}

/**
 * Решение системы линейных уравнений (метод Гаусса)
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  const augmented = A.map((row, i) => [...row, b[i]]);
  
  // Прямой ход
  for (let i = 0; i < n; i++) {
    // Поиск максимального элемента
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    
    // Обмен строк
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Исключение
    for (let k = i + 1; k < n; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }
  
  // Обратный ход
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= augmented[i][j] * x[j];
    }
    x[i] /= augmented[i][i];
  }
  
  return x;
}

/**
 * Основная функция расчёта призменного элемента
 */
export function calculatePrismCoupling(params: PrismInputParams): PrismOutputResult {
  const { modesNeff, Ne, polarization } = params;
  let { alpha, gamma } = params;
  
  // Преобразование показателей преломления в диэлектрические проницаемости
  const e: [number, number, number] = [
    0, // e[0] - будет вычислен (в волноводе)
    Ne * Ne, // e[1] - подложка (e(2) = Ne^2)
    1 // e[2] - объём/воздух (e(3) = 1)
  ];
  
  // Квадраты эффективных показателей преломления (Em = modesNeff.^2)
  const Em = modesNeff.map(n => n * n);
  
  // Начальное приближение для e0 (строка 14: e0=(Em(1)-Em(2))*0.25+Em(1))
  let e0 = (Em[0] - Em[1]) * 0.25 + Em[0];
  e[0] = e0;
  
  // Параметр xa (строка 17-18: xa=1; xa(strcmp(TEM,'TM'))=e(3)/e(1))
  let xa = 1;
  if (polarization) { // TM
    xa = e[2] / e[0];
  }
  
  // Начальное значение альфа (если не задано)
  let initialAlpha = alpha;
  if (initialAlpha < 0.2) initialAlpha = 0.4;
  if (initialAlpha > 20) initialAlpha = 6;
  
  // Определяем режим оптимизации
  let optimizationMode: 'both' | 'alpha' | 'none' = 'none';
  if (alpha === -100 && gamma === 0) {
    optimizationMode = 'both'; // Оптимизируем оба параметра
  } else if (alpha === -100) {
    optimizationMode = 'alpha'; // Оптимизируем только альфа
  }
  
  let calculatedAlpha = initialAlpha;
  let AB: [number, number] = [0, 0];
  let errorValue = 0;
  
  // Функция для оптимизации e0
  const optimizeE0 = (testE0: number): number => {
    e[0] = testE0;
    
    // Обновляем xa для TM поляризации (зависит от e[0])
    let currentXa = 1;
    if (polarization) {
      currentXa = e[2] / e[0];
    }
    
    const b = Em.map(em => {
      const denom = e[0] - e[1];
      if (Math.abs(denom) < 1e-10) return 0;
      return (em - e[1]) / denom;
    });
    const b1 = b.map(bi => 1 - bi);
    
    const mi = modesNeff.map((_, i) => {
      const num = e[0] - Em[i];
      const denom = Em[i] - e[2];
      if (num < 0 || denom <= 0) return i + 0.75;
      // В MATLAB: atan(xa*(e0-Em)./(Em-e2))/pi (БЕЗ sqrt!)
      const term = Math.atan(currentXa * (num / denom)) / Math.PI;
      return i - term + 0.75;
    });
    
    // Функция для поиска альфа
    const findAlphaFunc = (testAlpha: number): number => {
      // clamp alpha
      const a = Math.max(0.2, Math.min(20, testAlpha));
      const ba = b1.map(b1i => Math.pow(Math.max(b1i, 1e-12), a));
      const F = calculateF(b.map(v => Math.max(v, 1e-12)), b1.map(v => Math.max(v, 1e-12)));
      
      let sum1 = 0, sum2 = 0, sum3 = 0, sum4 = 0;
      for (let i = 0; i < ba.length; i++) {
        const lnB1 = Math.log(Math.max(b1[i], 1e-12));
        sum1 += ba[i] * ba[i] * lnB1;
        sum2 += F[i] * ba[i] * lnB1;
        sum3 += mi[i] * ba[i] * lnB1;
        sum4 += ba[i] * ba[i];
      }
      
      if (gamma === 0) {
        const det = sum1 * sum4 - sum2 * sum2;
        return det;
      } else {
        return sum1 - sum3;
      }
    };
    
    // Находим оптимальную альфа
    if (optimizationMode === 'both' || optimizationMode === 'alpha') {
      calculatedAlpha = fzero(findAlphaFunc, initialAlpha);
      if (calculatedAlpha < 0.2) calculatedAlpha = 0.2;
      if (calculatedAlpha > 20) calculatedAlpha = 20;
    }
    
    // Вычисляем AB для текущей альфа
    const ba = b1.map(b1i => Math.pow(Math.max(b1i, 1e-12), calculatedAlpha));
    const F = calculateF(b.map(v => Math.max(v, 1e-12)), b1.map(v => Math.max(v, 1e-12)));
    
    if (gamma === 0) {
      // Решаем систему для нахождения A и B
      const Q = [
        [ba.reduce((s, v, i) => s + v * v, 0), F.reduce((s, v, i) => s + v * ba[i], 0)],
        [F.reduce((s, v, i) => s + v * ba[i], 0), F.reduce((s, v) => s + v * v, 0)]
      ];
      const c = [
        mi.reduce((s, v, i) => s + v * ba[i], 0),
        mi.reduce((s, v, i) => s + v * F[i], 0)
      ];
      const solution = solveLinearSystem(Q, c);
      AB = [solution[0], solution[1]];
    } else {
      // Упрощённый случай с заданной гаммой
      const s1 = mi.reduce((s, v, i) => s + v * ba[i], 0) /
                ba.reduce((s, v, i) => s + v * (ba[i] + gamma * F[i]), 0);
      AB = [s1, s1 * gamma];
    }
    
    // Вычисляем ошибку
    const s1Array = b1.map((b1i, i) => {
      const sb1 = Math.max(b1i, 1e-12);
      const sb = Math.max(b[i], 1e-12);
      const term1 = calculatedAlpha * AB[0] * Math.pow(sb1, calculatedAlpha - 1);
      const term2 = Math.atan(Math.sqrt(sb1 / sb)) / Math.sqrt(sb) * AB[1] / 2;
      return 1 + Math.pow(term1 + term2, 2);
    });
    
    errorValue = ba.reduce((sum, bai, i) => {
      const residual = AB[0] * bai + AB[1] * F[i] - mi[i];
      return sum + (residual * residual) / s1Array[i];
    }, 0);
    
    return errorValue;
  };
  
  // Минимизация по e0 методом Ньютона
  if (optimizationMode === 'both') {
    const h = 0.0002;
    let ex = e0;
    let dx = 1;
    
    while (Math.abs(dx) > h / 10) {
      const ee = ex - h;
      const ff = [
        optimizeE0(ee),
        optimizeE0(ee + h),
        optimizeE0(ee + 2 * h)
      ];
      dx = (ff[2] - ff[0]) / (ff[2] - 2 * ff[1] + ff[0]) * h / 2;
      ex = ex - dx;
    }
    
    optimizeE0(ex);
    e0 = ex;
  } else {
    optimizeE0(e0);
  }
  
  // Финальный расчёт профиля
  e[0] = e0;
  
  // Обновляем xa финально
  let finalXa = 1;
  if (polarization) {
    finalXa = e[2] / e[0];
  }
  
  const de = e[0] - e[1];
  if (Math.abs(de) < 1e-10) {
    throw new Error('Ошибка: e[0] слишком близко к e[1]. Проверьте входные параметры.');
  }
  
  const Em_final = Em; // уже вычислено ранее
  const bm = Em_final.map(em => (em - e[1]) / de);
  const b2 = bm.map(bi => 1 - bi);
  
  // Генерируем массив b для построения профиля (строка 81: b=1:-0.0001:0.0001)
  const bArray: number[] = [];
  for (let bi = 1; bi >= 0.0001; bi -= 0.0001) {
    bArray.push(bi);
  }
  const b1Array = bArray.map(bi => 1 - bi);
  
  // Вычисляем z и N
  let z = calculateProfile(bArray, calculatedAlpha, AB, e) as number[];
  
  const m = b1Array.map((b1i, i) => {
    const F_val = Math.sqrt(b1i) - Math.sqrt(bArray[i]) * Math.atan(Math.sqrt(b1i / bArray[i]));
    return AB[0] * Math.pow(b1i, calculatedAlpha) + AB[1] * F_val;
  });
  const N = bArray.map(bi => Math.sqrt(bi * de + e[1]));
  
  // Вычисляем zm и Nm для мод
  let zm = calculateProfile(bm, calculatedAlpha, AB, e) as number[];
  
  const Nm = bm.map(bi => Math.sqrt(bi * de + e[1]));
  
  // Проверяем и фильтруем некорректные значения
  z = z.map(v => isFinite(v) && !isNaN(v) ? v : 0);
  zm = zm.map(v => isFinite(v) && !isNaN(v) ? v : 0);
  
  // Вычисляем mi (строка 40-41, 54-55)
  const mi = modesNeff.map((_, i) => {
    const num = e[0] - Em_final[i];
    const denom = Em_final[i] - e[2];
    if (num < 0 || denom <= 0) return i + 0.75;
    // В MATLAB: atan(xa*(e0-Em)./(Em-e2))/pi (БЕЗ sqrt!)
    const term = Math.atan(finalXa * (num / denom)) / Math.PI;
    return i - term + 0.75;
  });
  
  return {
    N,
    z,
    Nm,
    zm,
    b: bArray,
    bm,
    m,
    mi,
    calculatedAlpha,
    calculatedGamma: gamma,
    AB,
    n0: Math.sqrt(e[0]),
    error: errorValue
  };
}

/**
 * Вспомогательная функция для форматирования результатов в текст
 */
export function formatResultsAsText(params: PrismInputParams, results: PrismOutputResult): string {
  const { polarization, modesNeff, Ne } = params;
  const { calculatedAlpha, calculatedGamma, n0, zm, Nm, z, N } = results;
  
  let output = '';
  output += `Расчёт призменного элемента связи\n`;
  output += `Дата: ${new Date().toLocaleString()}\n\n`;
  output += `Поляризация: ${polarization ? 'TM' : 'TE'}\n`;
  output += `Neff (моды 0, 1, 2, ...): ${modesNeff.join(', ')}\n`;
  output += `Ne (подложка): ${Ne.toFixed(4)}\n`;
  output += `n0 (на поверхности): ${n0.toFixed(4)}\n`;
  output += `α (степень аппроксимации): ${calculatedAlpha.toFixed(4)}\n`;
  output += `B/A (отношение параметров): ${calculatedGamma.toFixed(4)}\n\n`;
  
  output += `Моды:\n`;
  output += `z (мкм)\t\tΔne\n`;
  for (let i = 0; i < zm.length; i++) {
    output += `${zm[i].toFixed(4)}\t\t${(Nm[i] - Ne).toFixed(4)}\n`;
  }
  
  output += `\nПрофиль Δne(z):\n`;
  output += `z (мкм)\t\tΔne\n`;
  for (let i = 0; i < Math.min(z.length, 100); i++) {
    output += `${z[i].toFixed(4)}\t\t${(N[i] - Ne).toFixed(4)}\n`;
  }
  
  return output;
}

