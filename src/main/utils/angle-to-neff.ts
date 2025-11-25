import {degreesToRadians, parseDMSAngle} from './angle-parser';

/**
 * Вычисление Neff по углам мод через призму
 * @param modeAngles - массив углов мод (в градусах)
 * @param NeAngle (k13) - угол ввода излучения подложки (градусы)
 * @param prismAngle  (k14) - угол призмы (градусы)
 * @param volumeAngle (k12) - угол объема
 * @param nPrism - показатель преломления призмы
 * @returns массив эффективных показателей преломления
 */
export function calculateNeffFromAngles(
  modeAngles: number[],
  NeAngle: number,
  prismAngle: number,
  volumeAngle: number,
  nPrism: number
): [number[], number] {

  const eps = NeAngle - prismAngle;
  const ce = Math.cos(degreesToRadians(eps));
  const se = Math.sin(degreesToRadians(eps));

  const epsVol = prismAngle - volumeAngle;
  const sinVol = Math.sin(degreesToRadians(epsVol));

  const NeNeff = sinVol * ce + Math.sqrt(nPrism * nPrism - (sinVol * sinVol)) * se;

  const Neff = modeAngles.map(angle => {
    const angleDiff = prismAngle - angle;
    const sa = Math.sin(degreesToRadians(angleDiff));
    const term = nPrism * nPrism - sa * sa;
    
    if (term < 0) {
      return 1.5; // возвращаем разумное значение
    }
    
    const result = sa * ce + Math.sqrt(term) * se;

    return result;
  });

  return [Neff, NeNeff];
}

export const parseIfDMS = (value: number): number => {
  // Если значение > 100 и не содержит точку - возможно DMS формат
  if (value > 100 && !value.toString().includes('.')) {
    try {
      const str = Math.floor(value).toString().padStart(7, '0');
      const angle = parseDMSAngle(str);
      return angle;
    } catch (e) {
      return value;
    }
  }
  return value;
};

