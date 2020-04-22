import Typography from "typography"
import Lawton from 'typography-theme-lawton'

Lawton.baseFontSize = 18;
Lawton.baseLineHeight = 1.2;
const typography = new Typography(Lawton)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
