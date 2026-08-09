import { hexToRgba } from '../../utils/certificateTemplate'

export const textSafeStyle = {
  letterSpacing: 0,
  wordSpacing: '0.08em',
  whiteSpace: 'normal' }

export const getDetailChipStyle = (accentColor) => ({
  borderColor: hexToRgba(accentColor, 0.2),
  background: `linear-gradient(180deg, rgba(255,255,255,0.96), ${hexToRgba(accentColor, 0.05)})`,
  borderRadius: 'clamp(8px, 1.2cqw, 18px)',
  padding: 'clamp(4px, 0.5cqw, 8px) clamp(8px, 0.9cqw, 16px)',
  textAlign: 'left' })
