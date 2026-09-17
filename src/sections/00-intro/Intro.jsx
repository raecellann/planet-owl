import { useCallback, useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { A } from '../../lib/assets'

import cloudPuffImg from '../../../assets/section 2/image 35.png'

/**
 * The whole scene runs off ONE value.
 *
 *   0    parked
 *   1    hover — mid-flight, cursor still on the button
 *   1.9  launched — past the camera and gone
 */
const HOVER = 1
const LAUNCH = 1.9

/**
 * Radial mask kept ONLY for the large background plates (cloudBig/cloud34) 
 * since those are still large uncropped plates that need edge fading.
 */
const CLOUD_FADE =
  '[mask-image:radial-gradient(ellipse_85%_75%_at_50%_50%,#000_55%,transparent_100%)]'

export default function Intro({ onEnter, onDone }) {
  const reduce = useReducedMotion()
  const p = useMotionValue(0)
  const opacity = useMotionValue(1)
  const promptOpacity = useMotionValue(1)
  const sectionOpacity = useMotionValue(1)
  const running = useRef([])
  const launched = useRef(false)
  const doneTimer = useRef(null)

  const stop = () => {
    running.current.forEach((c) => c.stop())
    running.current = []
  }

  // ---- Jet animation transforms ----
  const jetX = useTransform(p, [0, HOVER, LAUNCH], ['0vw', '-34vw', '-160vw'])
  const jetY = useTransform(p, [0, HOVER, LAUNCH], ['0vh', '7vh', '32vh'])
  const jetScale = useTransform(p, [0, HOVER, LAUNCH], [0.85, 1.2, 2.2])
  const jetRotate = useTransform(p, [0, HOVER, LAUNCH], [0, -7, -14])

  // ---- Background cloud parallax & hover-clarity transforms ----
  const farX = useTransform(p, [0, LAUNCH], ['0vw', '15vw'])
  const farScale = useTransform(p, [0, LAUNCH], [1, 1.08])
  
  const midX = useTransform(p, [0, LAUNCH], ['0vw', '30vw'])
  const midScale = useTransform(p, [0, LAUNCH], [1, 1.15])
  // Fade out mid and near clouds on hover so the owl pilot is 100% crystal clear and visible
  const midOpacity = useTransform(p, [0, HOVER], [1, 0.1])

  const nearX = useTransform(p, [0, LAUNCH], ['0vw', '50vw'])
  const nearScale = useTransform(p, [0, LAUNCH], [1, 1.25])
  const nearOpacity = useTransform(p, [0, HOVER], [1, 0.15])

  const veilOpacity = useTransform(p, [0, 0.42], [1, 0])
  const skyScale = useTransform(p, [0, LAUNCH], [1.6, 1.68])

  const drive = useCallback(
    (to, options) => {
      stop()
      running.current = [animate(p, to, options)]
    },
    [p],
  )

  const flyIn = useCallback(() => {
    if (reduce || launched.current) return
    drive(HOVER, { duration: 1.8, ease: [0.16, 0.7, 0.26, 1] })
  }, [drive, reduce])

  const flyBack = useCallback(() => {
    if (reduce || launched.current) return
    drive(0, { type: 'spring', stiffness: 60, damping: 19, mass: 1.15 })
  }, [drive, reduce])

  const launch = useCallback(() => {
    if (launched.current) return
    launched.current = true

    animate(promptOpacity, 0, { duration: 0.2, ease: 'easeOut' })
    onEnter?.()

    clearTimeout(doneTimer.current)
    doneTimer.current = setTimeout(() => onDone?.(), 2000)

    if (reduce) {
      onDone?.()
      return
    }

    const DURATION = 1.2
    const EASING = [0.4, 0, 0.2, 1]

    drive(LAUNCH, { duration: DURATION, ease: EASING })

    // The fade waits for the jet to finish its launch, rather than starting
    // partway through it — the departure reads as fly-off-then-fade instead
    // of the two blending into one motion.
    animate(sectionOpacity, 0, {
      duration: 0.6,
      delay: DURATION,
      ease: 'easeOut',
      onComplete: () => {
        onDone?.()
      },
    })
  }, [onEnter, onDone, drive, promptOpacity, sectionOpacity, reduce])

  useEffect(
    () => () => {
      stop()
      clearTimeout(doneTimer.current)
    },
    [],
  )

  return (
    <motion.section
      id="top"
      style={{ opacity: sectionOpacity }}
      className="fixed inset-0 z-40 h-[100svh] w-full overflow-hidden pointer-events-auto select-none"
    >
      {/* 0 · Background Clouds Base */}
      <div className="absolute inset-0 z-0 bg-[#e3ded9]" />
      <motion.div style={{ scale: skyScale }} className="absolute inset-0 z-0 origin-center overflow-hidden">
        <img
          src={A.cloudBig}
          alt=""
          fetchPriority="high"
          className={`absolute left-[-125.9vw] top-[-70.8%] w-[174.8vw] max-w-none rotate-[-172.25deg] ${CLOUD_FADE}`}
        />
        <img
          src={A.cloudBig}
          alt=""
          fetchPriority="high"
          className={`absolute left-[15.4vw] top-[-19%] w-[139.1vw] max-w-none rotate-[-171.77deg] ${CLOUD_FADE}`}
        />
        <img
          src={A.cloudBig}
          alt=""
          className={`absolute -left-[46vw] top-[22%] w-[126vw] max-w-none ${CLOUD_FADE}`}
        />
        <img
          src={A.cloud34}
          alt=""
          fetchPriority="high"
          className={`absolute left-[38.4vw] top-[-24.4%] w-[103.5vw] max-w-none rotate-[164.2deg] ${CLOUD_FADE}`}
        />
      </motion.div>

      {/* 1 · Far Clouds */}
      <motion.div
        aria-hidden
        style={{ x: farX, scale: farScale }}
        className="pointer-events-none absolute inset-0 z-10"
      >
        <img src={cloudPuffImg} alt="" className="absolute left-[16%] top-[6%] w-[34%] opacity-45 blur-[3px]" />
        <img src={cloudPuffImg} alt="" className="absolute -right-[6%] top-[16%] w-[30%] -scale-x-100 opacity-40 blur-[4px]" />
        <img src={cloudPuffImg} alt="" className="absolute left-[45%] top-[2%] w-[25%] opacity-35 blur-[5px]" />
        <img src={cloudPuffImg} alt="" className="absolute -left-[5%] top-[25%] w-[40%] -scale-y-100 opacity-30 blur-[4px]" />
      </motion.div>

      {/* 2 · Mid Clouds */}
      <motion.div
        aria-hidden
        style={{ x: midX, scale: midScale, opacity: midOpacity }}
        className="pointer-events-none absolute inset-0 z-20"
      >
        <img src={cloudPuffImg} alt="" className="absolute -left-[14%] top-[40%] w-[58%] opacity-80" />
        <img src={cloudPuffImg} alt="" className="absolute -right-[18%] top-[30%] w-[54%] -scale-x-100 opacity-70" />
        
        <img 
          src={cloudPuffImg} 
          alt="" 
          className="absolute left-[46vw] top-[18%] w-[50vw] opacity-80" 
        />

        <img src={cloudPuffImg} alt="" className="absolute left-[20%] top-[45%] w-[45%] opacity-60 blur-[1px]" />
        <img src={cloudPuffImg} alt="" className="absolute right-[15%] top-[10%] w-[50%] -scale-x-100 -scale-y-100 opacity-55 blur-[2px]" />
      </motion.div>

      {/* 3 · The Jet */}
      {/* Mirrored: the source plate has the nose/propeller pointing right, but
          `jetX` carries it LEFT across the frame on launch — nose-first now
          matches the direction it actually travels. `scaleX` on the motion
          style rather than a `-scale-x-100` class, same reason as the
          portfolio pilots in `Portfolio.jsx`: Motion writes the whole
          `transform` inline for `x`/`y`/`scale`/`rotate`, and a class-based
          transform would just be dropped the moment the animation runs. */}
      <motion.img
        src={A.owl.front}
        alt="An owl pilot flying a green propeller plane through the clouds"
        fetchPriority="high"
        style={{ x: jetX, y: jetY, scale: jetScale, scaleX: -1, rotate: jetRotate, opacity }}
        className="pointer-events-none absolute left-[73%] top-[42%] z-30 w-[52vw] max-w-none -translate-x-1/2 -translate-y-1/2 select-none drop-shadow-[0_25px_35px_rgba(54,14,57,0.25)]"
      />

      {/* 4 · Near Clouds & Veil */}
      <motion.div
        aria-hidden
        style={{ x: nearX, scale: nearScale, opacity: nearOpacity }}
        className="pointer-events-none absolute inset-0 z-40"
      >
        <img src={cloudPuffImg} alt="" className="absolute -left-[22%] top-[78%] w-[66%] opacity-75" />
        <img src={cloudPuffImg} alt="" className="absolute -right-[26%] top-[82%] w-[72%] -scale-x-100 opacity-65" />
        
        <img src={cloudPuffImg} alt="" className="absolute left-[15%] top-[86%] w-[80%] opacity-90 blur-[1px]" />
        <img src={cloudPuffImg} alt="" className="absolute -left-[10%] -bottom-[25%] w-[100%] opacity-95 blur-[2px]" />
        <img src={cloudPuffImg} alt="" className="absolute -right-[15%] -bottom-[30%] w-[110%] -scale-x-100 opacity-90 blur-[2px]" />

        {/* Cloud Veil surrounding plane */}
        {/* Changed gap-8 sm:gap-10 to gap-6 sm:gap-8 */}
        <motion.div
          style={{ opacity: promptOpacity }}
          className="absolute inset-x-0 top-[74%] z-50 flex flex-col items-center gap-6 px-6 text-center pointer-events-auto sm:gap-8"
        >
          <img src={cloudPuffImg} alt="" className="absolute -left-[15%] -top-[20%] w-[80%] opacity-75" />
          <img src={cloudPuffImg} alt="" className="absolute -right-[15%] -top-[20%] w-[80%] -scale-x-100 opacity-75" />
          <img src={cloudPuffImg} alt="" className="absolute -left-[25%] top-[40%] w-[70%] opacity-70" />
          <img src={cloudPuffImg} alt="" className="absolute -right-[25%] top-[40%] w-[70%] -scale-x-100 opacity-70" />
        </motion.div>
      </motion.div>

      {/* 5 · The Prompt */}
      <motion.div
        style={{ opacity: promptOpacity }}
        className="absolute inset-x-0 top-[74%] z-50 flex flex-col items-center gap-3 px-6 text-center pointer-events-auto sm:gap-4"
      >
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-shadow-soft font-['Momo_Trust_Display'] text-[clamp(1.5rem,3vw,3.5rem)] font-normal tracking-tight text-plum-800"
        >
          Are you ready to fly?
        </motion.h1>

        <motion.button
          type="button"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onPointerEnter={flyIn}
          onPointerLeave={flyBack}
          onFocus={flyIn}
          onBlur={flyBack}
          onClick={launch}
          whileTap={{ y: 2 }}
          aria-label="Enter Planet Owl"
          // IMPROVED PADDING & TEXT SIZE: px-10 py-4 text-lg
          className="btn-type rounded-full bg-gold-500 px-10 py-4 text-lg font-semibold text-plum-900 shadow-[0_6px_0_-2px_var(--color-plum-900),0_20px_35px_-15px_rgba(54,14,57,0.65)] select-none transition-colors duration-200 active:bg-teal-500"
        >
          Hold the button
        </motion.button>
      </motion.div>
          
    </motion.section>
  )
}