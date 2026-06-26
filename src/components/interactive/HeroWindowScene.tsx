'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import planeImg from '@/image/plane.png'
import cloud1Img from '@/image/cloud1.png'
import cloud2Img from '@/image/cloud2.png'
import spaceshipImg from '@/image/spaceship.png'
import starImg from '@/image/star.png'
import planetImg from '@/image/planet.png'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeroWindowSceneProps {
  windowRef: React.RefObject<HTMLDivElement | null>
  onSceneChange?: (scene: 'cloud' | 'space') => void
}

interface Dims {
  w: number
  h: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLANE_W = 66
const SPACESHIP_W = 60
const CLOUD1_W = 120
const CLOUD2_W = 100
const STAR_W = 180
const PLANET_W = 160

const SHIFT_X = -6
const SHIFT_Y = -10

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// useDimensions
// ---------------------------------------------------------------------------

function useDimensions(ref: React.RefObject<HTMLDivElement | null>): Dims | null {
  const [dims, setDims] = useState<Dims | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) {
      setDims({ w: r.width, h: r.height })
    }
  }, [ref])

  return dims
}

// ---------------------------------------------------------------------------
// CloudScene — 云朵飞机场景（保持不变）
// ---------------------------------------------------------------------------

interface CloudParams {
  dir: 'ltr' | 'rtl'
  flightDuration: number
  planeY: number
  oscillation: number
  tilt: number
  startX: number
  endX: number
  c1Left: number
  c1Top: number
  c2Left: number
  c2Top: number
}

function CloudScene({ w, h, onDone }: { w: number; h: number; onDone: () => void }) {
  const [cloudsVisible, setCloudsVisible] = useState(false)
  const [planeMounted, setPlaneMounted] = useState(false)

  const [params] = useState<CloudParams>(() => {
    const dir: 'ltr' | 'rtl' = Math.random() > 0.5 ? 'ltr' : 'rtl'
    const flightDuration = 10 + Math.random() * 2
    const planeY = h * 0.2 + Math.random() * h * 0.22
    const oscillation = 8 + Math.random() * 7
    const tilt = -3 + Math.random() * 6

    // 左侧完全飞出，右侧飞出一半
    const startX = dir === 'ltr' ? 0 : w - PLANE_W
    const endX = dir === 'ltr' ? w - PLANE_W + 30 : 20

    const c1Left = Math.max(14, Math.random() * w * 0.18)
    const c1Top = Math.max(12, h * 0.06 + Math.random() * h * 0.1)
    const c2Left = Math.min(w - CLOUD2_W - 14, w * 0.55 + Math.random() * w * 0.25)
    const c2Top = Math.max(8, h * 0.02 + Math.random() * h * 0.12)
    return { dir, flightDuration, planeY, oscillation, tilt, startX, endX, c1Left, c1Top, c2Left, c2Top }
  })

  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    let cancelled = false

    async function run(): Promise<void> {
      setCloudsVisible(true)
      await sleep(2000)
      if (cancelled) return

      await sleep(1000)
      if (cancelled) return

      setPlaneMounted(true)
      await sleep(params.flightDuration * 1000)
      if (cancelled) return
      setPlaneMounted(false)

      setCloudsVisible(false)
      await sleep(2000)
      if (cancelled) return

      await sleep(2000)
      if (cancelled) return

      onDoneRef.current()
    }

    run()
    return () => { cancelled = true }
  }, [params.flightDuration])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: cloudsVisible ? 1 : 0 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: 0, zIndex: 15 }}
      >
        <motion.img
          src={cloud1Img.src}
          alt=""
          style={{ position: 'absolute', width: CLOUD1_W, left: params.c1Left, top: params.c1Top }}
          animate={{ x: [0, 10, 0, -10, 0], y: [0, -5, 0, 5, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
        <motion.img
          src={cloud2Img.src}
          alt=""
          style={{ position: 'absolute', width: CLOUD2_W, left: params.c2Left, top: params.c2Top }}
          animate={{ x: [0, -8, 0, 8, 0], y: [0, 4, 0, -4, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      <AnimatePresence>
        {planeMounted && (
          <motion.img
            src={planeImg.src}
            alt=""
            style={{
              position: 'absolute',
              width: PLANE_W,
              top: params.planeY,
              zIndex: 20,
              scaleX: params.dir === 'ltr' ? -1 : 1,
            }}
            initial={{ x: params.startX, rotate: 0, opacity: 0 }}
            animate={{
              x: params.endX,
              y: [0, -params.oscillation, 0, params.oscillation, 0],
              rotate: params.tilt,
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              x: { duration: params.flightDuration, ease: 'linear' },
              y: { duration: params.flightDuration / 4, repeat: 3, ease: 'easeInOut' },
              rotate: { duration: params.flightDuration, ease: 'linear' },
              opacity: { duration: 0.3 },
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// SpaceScene — 宇宙飞船场景
// ---------------------------------------------------------------------------

interface SpaceParams {
  dir: 'ltr' | 'rtl'
  flightDuration: number
  spaceshipBottom: number
  oscillation: number
  startX: number
  endX: number
  starLeft: number
  starBottom: number
  planetLeft: number
  planetBottom: number
}

function SpaceScene({ w, h, onDone }: { w: number; h: number; onDone: () => void }) {
  const [elementsVisible, setElementsVisible] = useState(false)
  const [spaceshipMounted, setSpaceshipMounted] = useState(false)

  const [params] = useState<SpaceParams>(() => {
    const dir: 'ltr' | 'rtl' = Math.random() > 0.5 ? 'ltr' : 'rtl'
    const flightDuration = 10 + Math.random() * 2
    const oscillation = 5 + Math.random() * 5
    // 飞船底部定位，保证永远在可视区域内
    const spaceshipBottom = h * 0.18 + Math.random() * h * 0.08

    // 左侧完全飞出，右侧飞出一半
    const startX = dir === 'ltr' ? 0 : w - SPACESHIP_W
    const endX = dir === 'ltr' ? w - SPACESHIP_W - 20 : 20

    // 星星与行星位置
    const starLeft = Math.max(10, Math.random() * w * 0.2)
    const starBottom = Math.max(8, h * 0.03)
    const planetLeft = Math.min(w - PLANET_W - 10, w * 0.5 + Math.random() * w * 0.25)
    const planetBottom = Math.max(10, h * 0.04)
    return { dir, flightDuration, spaceshipBottom, oscillation, startX, endX, starLeft, starBottom, planetLeft, planetBottom }
  })

  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    let cancelled = false

    async function run(): Promise<void> {
      // Step 1：星星与行星淡入（2s）
      setElementsVisible(true)
      await sleep(2000)
      if (cancelled) return

      // Step 2：等待（1s）
      await sleep(1000)
      if (cancelled) return

      // Step 3：宇宙飞船驶过
      setSpaceshipMounted(true)
      await sleep(params.flightDuration * 1000)
      if (cancelled) return
      setSpaceshipMounted(false)

      // Step 4：星星与行星淡出（2s）
      setElementsVisible(false)
      await sleep(2000)
      if (cancelled) return

      // Step 5：空窗等待（2s）
      await sleep(2000)
      if (cancelled) return

      onDoneRef.current()
    }

    run()
    return () => { cancelled = true }
  }, [params.flightDuration, params.dir])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* 星星与行星 — 淡入淡出 + 悬浮动画 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: elementsVisible ? 1 : 0 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: 0, zIndex: 15 }}
      >
        <motion.img
          src={starImg.src}
          alt=""
          style={{ position: 'absolute', width: STAR_W, left: params.starLeft, bottom: params.starBottom }}
          animate={{ y: [0, -4, 0, 4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.img
          src={planetImg.src}
          alt=""
          style={{ position: 'absolute', width: PLANET_W, left: params.planetLeft, bottom: params.planetBottom }}
          animate={{ y: [0, 4, 0, -4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* 宇宙飞船 — 原图头朝左，从左向右飞行时自动翻转朝向 */}
      <AnimatePresence>
        {spaceshipMounted && (
          <motion.img
            src={spaceshipImg.src}
            alt=""
            style={{
              position: 'absolute',
              width: SPACESHIP_W,
              bottom: params.spaceshipBottom,
              zIndex: 20,
              // 左→右飞行时翻转，保证头部朝向飞行方向
              scaleX: params.dir === 'ltr' ? -1 : 1,
            }}
            initial={{ x: params.startX, opacity: 0 }}
            animate={{
              x: params.endX,
              y: [0, -params.oscillation, 0, params.oscillation, 0],
              rotate: [0, -2, 2, -2],
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              x: { duration: params.flightDuration, ease: 'linear' },
              y: { duration: params.flightDuration / 4, repeat: 3, ease: 'easeInOut' },
              rotate: { duration: params.flightDuration / 2, repeat: 1, ease: 'easeInOut' },
              opacity: { duration: 0.3 },
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// HeroWindowScene
// ---------------------------------------------------------------------------

export function HeroWindowScene({ windowRef, onSceneChange }: HeroWindowSceneProps) {
  const dims = useDimensions(windowRef)
  const [scene, setScene] = useState<'cloud' | 'space'>('cloud')
  const [keySuffix, setKeySuffix] = useState(0)

  const onSceneChangeRef = useRef(onSceneChange)
  onSceneChangeRef.current = onSceneChange

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
        transform: `translate(${SHIFT_X}px, ${SHIFT_Y}px)`,
      }}
    >
      {dims && (
        <AnimatePresence mode="wait">
          {scene === 'cloud' ? (
            <CloudScene
              key={`cloud-${keySuffix}`}
              w={dims.w}
              h={dims.h}
              onDone={() => {
                setScene('space')
                setKeySuffix((k) => k + 1)
                onSceneChangeRef.current?.('space')
              }}
            />
          ) : (
            <SpaceScene
              key={`space-${keySuffix}`}
              w={dims.w}
              h={dims.h}
              onDone={() => {
                setScene('cloud')
                setKeySuffix((k) => k + 1)
                onSceneChangeRef.current?.('cloud')
              }}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  )
}