import { useState } from 'react';

import { IconBack } from '../../assets/icons';
import { ACCENT_PALETTE, AccentColor } from '../../enums';
import { computeHealthStats } from '../../helpers';
import type { UserProfile } from '../../interfaces';
import { Stepper } from '../stepper';

export interface ProfileScreenProps {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  onBack: () => void;
}

export function ProfileScreen({ onBack, onSave, profile }: ProfileScreenProps) {
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
            {(['homme', 'femme'] as const).map((g) => (
              <button
                key={g}
                className="flex-1 py-3.5 rounded-xl font-800 capitalize transition-all active:scale-95"
                style={{
                  backgroundColor: draft.gender === g ? draft.accentColor : '#1a1a1a',
                  border: draft.gender === g ? 'none' : '1px solid #2a2a2a',
                  color: draft.gender === g ? '#0d0d0d' : '#666',
                }}
                onClick={() => {
                  update('gender', g);
                }}>
                {g === 'homme' ? 'Homme' : 'Femme'}
              </button>
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
                  background: `linear-gradient(90deg, ${AccentColor.TEAL} 0%, ${AccentColor.MINT} 20%, ${AccentColor.LIME} 35%, ${AccentColor.GOLD} 55%, ${AccentColor.TANGERINE} 72%, ${AccentColor.SCARLET} 100%)`,
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

        {/* Accent color */}
        <div>
          <label
            className="block text-xs font-800 tracking-widest uppercase mb-2.5"
            style={{ color: draft.accentColor }}>
            Couleur d'accent
          </label>
          <div className="flex gap-3 flex-wrap">
            {ACCENT_PALETTE.map((c) => (
              <button
                key={c}
                className="w-10 h-10 rounded-xl transition-all active:scale-90"
                style={{
                  backgroundColor: c,
                  border: draft.accentColor === c ? '3px solid #fff' : '3px solid transparent',
                  transform: draft.accentColor === c ? 'scale(1.15)' : 'scale(1)',
                }}
                onClick={() => {
                  update('accentColor', c);
                }}
              />
            ))}
          </div>
        </div>

        <button
          className="w-full rounded-2xl py-4 font-900 text-base transition-all active:scale-95"
          style={{ backgroundColor: draft.accentColor, color: '#0d0d0d' }}
          onClick={() => {
            onSave(draft);
            onBack();
          }}>
          Enregistrer le profil
        </button>
      </div>
    </div>
  );
}
