import {
  TrendingUp, Laptop, Code, Megaphone, Palette, BarChart, BookOpen, Target,
  Wrench, Globe, Lightbulb, GraduationCap, Trophy, Microscope, ScrollText,
  Music, Drama, Zap, Bot, Smartphone, Image as ImageIcon
} from 'lucide-react'

const ICON_MAP = {
  TrendingUp, Laptop, Code, Megaphone, Palette, BarChart, BookOpen, Target,
  Wrench, Globe, Lightbulb, GraduationCap, Trophy, Microscope, ScrollText,
  Music, Drama, Zap, Bot, Smartphone, ImageIcon
}

export const CategoryIcon = ({ icon, className = "w-6 h-6" }) => {
  const IconComponent = ICON_MAP[icon]

  if (IconComponent) {
    return <IconComponent className={className} />
  }

  // Fallback to default SVG icon
  return <BookOpen className={className} />
}

export const CATEGORY_ICON_OPTIONS = Object.keys(ICON_MAP)
