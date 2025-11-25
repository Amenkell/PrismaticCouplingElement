export interface PrismInputParams {
    /** Показатель преломления призмы */
    nPrism: number;
    /** Эффективные показатели преломления мод (Neff) */
    modesNeff: number[];
    /** Показатель преломления подложки (Ne) */
    Ne: number;
    /** Альфа - степень аппроксимации профиля */
    alpha: number;
    /** Гамма (B/A) - отношение параметров аппроксимации */
    gamma: number;
    /** Поляризация: true = TM, false = TE */
    polarization: boolean;
}

export interface PrismOutputResult {
    /** Массив эффективных показателей преломления по глубине */
    N: number[];
    /** Массив глубины (z), мкм */
    z: number[];
    /** Эффективные показатели преломления для мод */
    Nm: number[];
    /** Глубина для мод */
    zm: number[];
    /** Нормализованная координата b */
    b: number[];
    /** Нормализованная координата b для мод */
    bm: number[];
    /** Номера мод */
    m: number[];
    /** Номера мод (целые) */
    mi: number[];
    /** Рассчитанная альфа */
    calculatedAlpha: number;
    /** Рассчитанная гамма (B/A) */
    calculatedGamma: number;
    /** Параметры A и B аппроксимации */
    AB: [number, number];
    /** Показатель преломления на поверхности (n0) */
    n0: number;
    /** Среднеквадратичная ошибка аппроксимации */
    error: number;
}

export interface CalculationResults {
    NeNeff: number;
    prismResults: PrismOutputResult | null;
    isCalculated: boolean;
    timestamp: Date;
    hValue: number | null;
}