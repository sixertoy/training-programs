import type { HealthStats } from '../interfaces/health-stats.interface';
import type { HealthStatsInput } from '../interfaces/health-stats-input.interface';

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Insuffisance pondérale';
  if (bmi < 25) return 'Poids normal';
  if (bmi < 30) return 'Surpoids';
  return 'Obésité';
}

function getBmiColor(bmi: number): string {
  if (bmi < 18.5) return '#4ECDC4';
  if (bmi < 25) return '#cbff47';
  if (bmi < 30) return '#FFE66D';
  return '#FF6B6B';
}

export function computeHealthStats(profile: HealthStatsInput): HealthStats {
  const heightM = profile.heightCm / 100;
  const bmi = profile.weightKg / (heightM * heightM);
  const bmr =
    profile.gender === 'homme'
      ? Math.round(
          88.362 + 13.397 * profile.weightKg + 4.799 * profile.heightCm - 5.677 * profile.age,
        )
      : Math.round(
          447.593 + 9.247 * profile.weightKg + 3.098 * profile.heightCm - 4.33 * profile.age,
        );
  const idealWeight = Math.round(
    profile.gender === 'homme'
      ? profile.heightCm - 100 - (profile.heightCm - 150) / 4
      : profile.heightCm - 100 - (profile.heightCm - 150) / 2.5,
  );

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: getBmiCategory(bmi),
    bmiColor: getBmiColor(bmi),
    bmr,
    fcMax: 220 - profile.age,
    idealWeight,
  };
}
