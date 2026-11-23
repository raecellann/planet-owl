import { A } from '../lib/assets'

/**
 * The spiky, feathered edge from the Flock band, cut from the same plate and
 * filled with a plum section's colour. A strip of its own, because stretching
 * the plate over a tall section would stretch the tears with it.
 */
export default function SectionBreak({ edge }) {
  const mask = {
    WebkitMaskImage: `url(${A.goldPlate})`,
    maskImage: `url(${A.goldPlate})`,
    WebkitMaskSize: 'max(100%, 640px) auto',
    maskSize: 'max(100%, 640px) auto',
    WebkitMaskPosition: `center ${edge}`,
    maskPosition: `center ${edge}`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  }
  return <div aria-hidden style={mask} className="relative h-[max(38px,5.9vw)] w-full bg-plum-800" />
}
