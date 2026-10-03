import { useState } from 'react';

import { IconBack } from '../../assets/icons';
import { Gender, ViewMode } from '../../enums';
import { AccentColorPicker } from '../accent-color-picker';
import { Button } from '../button';
import { Stepper } from '../stepper';

interface UserProfile {
  firstName: string;
  lastName: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
  accentColor: string;
  defaultProgrammeView: ViewMode;
  streakGraceDays: number;
}

interface HealthStats {
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  bodyFatPct: number;
  bodyFatCategory: string;
  fcMax: number;
  bmr: number;
  idealWeight: number;
}

interface HealthStatsInput {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Insuffisance pondérale';
  if (bmi < 25) return 'Poids normal';
  if (bmi < 30) return 'Surpoids';
  return 'Obésité';
}

function getBmiColor(bmi: number, accentColor: string): string {
  if (bmi < 18.5) return '#4ECDC4';
  if (bmi < 25) return accentColor;
  if (bmi < 30) return '#FFE66D';
  return '#FF6B6B';
}

function getBodyFatCategory(bodyFatPct: number, gender: Gender): string {
  if (gender === Gender.MALE) {
    if (bodyFatPct < 10) return 'Athlétique';
    if (bodyFatPct < 20) return 'Forme';
    if (bodyFatPct < 25) return 'Moyen';
    return 'Élevé';
  }
  if (bodyFatPct < 18) return 'Athlétique';
  if (bodyFatPct < 28) return 'Forme';
  if (bodyFatPct < 32) return 'Moyen';
  return 'Élevé';
}

function computeHealthStats(profile: HealthStatsInput & { accentColor: string }): HealthStats {
  const heightM = profile.heightCm / 100;
  const bmi = profile.weightKg / (heightM * heightM);
  const sex = profile.gender === Gender.MALE ? 1 : 0;
  const bodyFatPct = Math.round((1.2 * bmi + 0.23 * profile.age - 10.8 * sex - 5.4) * 10) / 10;
  const bmr =
    profile.gender === Gender.MALE
      ? Math.round(
          88.362 + 13.397 * profile.weightKg + 4.799 * profile.heightCm - 5.677 * profile.age,
        )
      : Math.round(
          447.593 + 9.247 * profile.weightKg + 3.098 * profile.heightCm - 4.33 * profile.age,
        );
  const idealWeight = Math.round(
    profile.gender === Gender.MALE
      ? profile.heightCm - 100 - (profile.heightCm - 150) / 4
      : profile.heightCm - 100 - (profile.heightCm - 150) / 2.5,
  );

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: getBmiCategory(bmi),
    bmiColor: getBmiColor(bmi, profile.accentColor),
    bmr,
    bodyFatCategory: getBodyFatCategory(bodyFatPct, profile.gender),
    bodyFatPct,
    fcMax: 220 - profile.age,
    idealWeight,
  };
}

export function ProfilePage({
  onBack,
  onSave,
  profile,
}: {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState(profile);
  const health = computeHealthStats(draft);
  const update = <K extends keyof UserProfile>(key: K, val: UserProfile[K]) => {
    setDraft((d) => ({ ...d, [key]: val }));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-8 pb-5 flex items-center gap-4">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1a1a1a', color: '#f5f5f5' }}
          onClick={() => {
            onSave(draft);
            onBack();
          }}>
          <IconBack />
        </button>
        <h1 className="text-2xl font-900">Mon Profil</h1>
      </div>

      <div className="px-5 space-y-5 pb-8">
        {/* Identity */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Identité
          </label>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <input
              className="w-full px-4 py-3.5 font-700 text-base outline-none"
              placeholder="Prénom"
              style={{
                backgroundColor: 'transparent',
                borderBottom: '1px solid #2a2a2a',
                color: '#f5f5f5',
              }}
              type="text"
              value={draft.firstName}
              onChange={(e) => {
                update('firstName', e.target.value);
              }}
            />
            <input
              className="w-full px-4 py-3.5 font-700 text-base outline-none"
              placeholder="Nom"
              style={{ backgroundColor: 'transparent', color: '#f5f5f5' }}
              type="text"
              value={draft.lastName}
              onChange={(e) => {
                update('lastName', e.target.value);
              }}
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Genre
          </label>
          <div className="flex gap-3">
            {([Gender.MALE, Gender.FEMALE] as const).map((g) => (
              <Button
                key={g}
                className="flex-1 py-3.5 rounded-xl font-800 capitalize transition-all active:scale-95"
                label={g === Gender.MALE ? 'Homme' : 'Femme'}
                style={{
                  backgroundColor: draft.gender === g ? draft.accentColor : '#1a1a1a',
                  border: draft.gender === g ? '1px solid transparent' : '1px solid #2a2a2a',
                  color: draft.gender === g ? '#0d0d0d' : '#666',
                }}
                onClick={() => {
                  update('gender', g);
                }}
              />
            ))}
          </div>
        </div>

        {/* Physical data */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Données physiques
          </label>
          <div
            className="rounded-2xl overflow-hidden px-4"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            {[
              {
                key: 'age' as const,
                label: 'Âge',
                min: 10,
                step: 1,
                unit: 'ans',
                value: draft.age,
              },
              {
                key: 'heightCm' as const,
                label: 'Taille',
                min: 100,
                step: 1,
                unit: 'cm',
                value: draft.heightCm,
              },
              {
                key: 'weightKg' as const,
                label: 'Poids',
                min: 30,
                step: 1,
                unit: 'kg',
                value: draft.weightKg,
              },
            ].map((row, idx) => (
              <div
                key={row.key}
                className="flex items-center justify-between py-3.5"
                style={{ borderBottom: idx < 2 ? '1px solid #2a2a2a' : 'none' }}>
                <p className="text-sm font-700" style={{ color: '#aaa' }}>
                  {row.label}
                </p>
                <Stepper
                  min={row.min}
                  step={row.step}
                  unit={row.unit}
                  value={row.value}
                  onChange={(v) => {
                    update(row.key, v);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Calculated health stats */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Données de santé
          </label>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            {/* IMC */}
            <div className="p-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
              <p
                className="text-xs font-800 tracking-widest uppercase mb-3"
                style={{ color: '#555' }}>
                IMC
              </p>
              <div className="flex items-end justify-between mb-3">
                <span className="text-5xl font-900 leading-none">{health.bmi}</span>
                <span
                  className="text-sm font-800 px-3 py-1.5 rounded-full mb-1"
                  style={{ backgroundColor: `${health.bmiColor}25`, color: health.bmiColor }}>
                  {health.bmiCategory}
                </span>
              </div>
              {/* Gradient gauge with cursor */}
              <div
                className="relative h-2.5 rounded-full overflow-visible"
                style={{
                  background:
                    'linear-gradient(90deg, #4ECDC4 0%, #60D394 20%, #cbff47 35%, #FFD93D 55%, #FF9A3C 72%, #FF4757 100%)',
                }}>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md"
                  style={{
                    border: `2.5px solid ${health.bmiColor}`,
                    left: `clamp(0%, calc(${Math.min(100, Math.max(0, ((health.bmi - 16) / (40 - 16)) * 100))}% - 7px), calc(100% - 7px))`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {['16', '18.5', '25', '30', '40'].map((v) => (
                  <span key={v} className="text-xs font-700" style={{ color: '#444' }}>
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4" style={{ borderBottom: '1px solid #2a2a2a' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-800 text-sm">IMG estimé</p>
                  <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
                    Deurenberg
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-900 text-base" style={{ color: draft.accentColor }}>
                    {health.bodyFatPct} %
                  </p>
                  <p className="text-xs font-700 mt-0.5" style={{ color: '#888' }}>
                    {health.bodyFatCategory}
                  </p>
                </div>
              </div>
            </div>
            {[
              { label: 'FC max estimée', sub: '220 − âge', value: `${health.fcMax} bpm` },
              {
                label: 'Métabolisme de base',
                sub: 'Harris-Benedict',
                value: `${health.bmr} kcal/j`,
              },
              {
                label: 'Poids idéal',
                sub: 'Formule de Lorentz',
                value: `${health.idealWeight} kg`,
              },
            ].map((s, idx) => (
              <div
                key={s.label}
                className="flex items-center justify-between px-4 py-3.5"
                style={{ borderBottom: idx < 2 ? '1px solid #2a2a2a' : 'none' }}>
                <div>
                  <p className="font-800 text-sm">{s.label}</p>
                  <p className="text-xs font-600 mt-0.5" style={{ color: '#555' }}>
                    {s.sub}
                  </p>
                </div>
                <p className="font-900 text-base" style={{ color: draft.accentColor }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Streak tolerance */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Série
          </label>
          <div
            className="rounded-2xl px-4 py-4"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-800 text-sm">Jours sans activité tolérés</p>
                <p className="text-xs font-600 mt-1" style={{ color: '#555' }}>
                  Les repos programmés ne comptent pas comme absence
                </p>
              </div>
              <Stepper
                max={3}
                min={0}
                step={1}
                unit="j"
                value={draft.streakGraceDays}
                onChange={(v) => {
                  update('streakGraceDays', v);
                }}
              />
            </div>
          </div>
        </div>

        {/* Accent color */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Couleur d&apos;accent
          </label>
          <AccentColorPicker
            value={draft.accentColor}
            onChange={(c) => {
              update('accentColor', c);
            }}
          />
        </div>

        {/* Default programme view */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Vue programme
          </label>
          <div className="flex gap-3">
            {(
              [
                { id: ViewMode.WEEK, label: 'Semaine' },
                { id: ViewMode.MONTH, label: 'Mois' },
              ] as const
            ).map((option) => (
              <Button
                key={option.id}
                className="flex-1 py-3.5 rounded-xl font-800 transition-all active:scale-95"
                label={option.label}
                style={{
                  backgroundColor:
                    draft.defaultProgrammeView === option.id ? draft.accentColor : '#1a1a1a',
                  border:
                    draft.defaultProgrammeView === option.id
                      ? '1px solid transparent'
                      : '1px solid #2a2a2a',
                  color: draft.defaultProgrammeView === option.id ? '#0d0d0d' : '#666',
                }}
                onClick={() => {
                  update('defaultProgrammeView', option.id);
                }}
              />
            ))}
          </div>
        </div>

        <Button
          className="w-full rounded-2xl py-4 font-900 text-base transition-all active:scale-95"
          label="Enregistrer le profil"
          style={{ backgroundColor: draft.accentColor, color: '#0d0d0d' }}
          onClick={() => {
            onSave(draft);
            onBack();
          }}
        />
      </div>
    </div>
  );
}
