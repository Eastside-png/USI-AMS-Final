"use client"

import { useEffect, useState } from "react"
import type { BodyView, RegionId, RegionStatus } from "./data"
import { REGION_LABELS, STATUS_LABELS } from "./data"

const STATUS_FILL: Record<RegionStatus, string> = {
  healthy: "rgba(34,197,94,0.32)",
  monitoring: "rgba(245,158,11,0.42)",
  active: "rgba(239,68,68,0.52)",
}

const STATUS_STROKE: Record<RegionStatus, string> = {
  healthy: "#22C55E",
  monitoring: "#F59E0B",
  active: "#EF4444",
}

const FRONT_PATHS: Partial<Record<RegionId, string>> = {
  head: "M150 14 C131 14 119 29 119 48 C119 63 127 73 134 79 L134 92 C140 96 160 96 166 92 L166 79 C173 73 181 63 181 48 C181 29 169 14 150 14 Z",
  leftShoulder: "M134 96 C118 94 103 100 96 116 C92 126 92 140 98 150 C108 148 118 140 126 128 C131 120 134 108 134 98 Z",
  rightShoulder: "M166 96 C182 94 197 100 204 116 C208 126 208 140 202 150 C192 148 182 140 174 128 C169 120 166 108 166 98 Z",
  chest: "M134 100 C140 98 150 100 150 100 C150 100 160 98 166 100 C180 104 188 116 187 134 C186 150 176 160 162 162 C155 163 150 158 150 156 C150 158 145 163 138 162 C124 160 114 150 113 134 C112 116 120 104 134 100 Z",
  abdomen: "M138 164 C144 162 150 164 150 164 C150 164 156 162 162 164 C172 167 177 178 176 200 C175 226 170 246 162 252 C156 256 144 256 138 252 C130 246 125 226 124 200 C123 178 128 167 138 164 Z",
  leftHip: "M149 252 C137 251 126 256 121 270 C117 282 119 298 126 308 C135 314 147 310 150 301 L150 254 Z",
  rightHip: "M151 252 C163 251 174 256 179 270 C183 282 181 298 174 308 C165 314 153 310 150 301 L150 254 Z",
  leftQuad: "M150 305 L130 306 C121 309 116 324 116 346 C116 366 119 380 125 388 C135 392 147 390 150 383 Z",
  rightQuad: "M150 305 L170 306 C179 309 184 324 184 346 C184 366 181 380 175 388 C165 392 153 390 150 383 Z",
  leftHamstring: "M125 389 C120 397 119 405 123 411 C133 417 147 415 150 407 L150 384 C147 391 135 393 125 389 Z",
  rightHamstring: "M175 389 C180 397 181 405 177 411 C167 417 153 415 150 407 L150 384 C153 391 165 393 175 389 Z",
  leftKnee: "M132 413 C121 413 115 421 115 433 C115 445 121 453 132 453 C143 453 149 445 149 433 C149 421 143 413 132 413 Z",
  rightKnee: "M168 413 C157 413 151 421 151 433 C151 445 157 453 168 453 C179 453 185 445 185 433 C185 421 179 413 168 413 Z",
  leftCalf: "M132 455 C123 455 117 464 116 484 C115 512 119 542 126 558 C133 564 142 561 144 552 C146 528 145 488 142 470 C141 460 139 455 132 455 Z",
  rightCalf: "M168 455 C177 455 183 464 184 484 C185 512 181 542 174 558 C167 564 158 561 156 552 C154 528 155 488 158 470 C159 460 161 455 168 455 Z",
  leftAnkle: "M131 560 C124 560 119 566 119 575 C119 585 124 592 131 592 C138 592 143 585 143 575 C143 566 138 560 131 560 Z",
  rightAnkle: "M169 560 C162 560 157 566 157 575 C157 585 162 592 169 592 C176 592 181 585 181 575 C181 566 176 560 169 560 Z",
}

const BACK_PATHS: Partial<Record<RegionId, string>> = {
  upperBack: "M124 104 C138 96 162 96 176 104 C184 112 188 128 186 148 C174 154 160 157 150 157 C140 157 126 154 114 148 C112 128 116 112 124 104 Z",
  lowerBack: "M126 150 C138 158 162 158 174 150 C176 170 174 202 166 230 C160 242 140 242 134 230 C126 202 124 170 126 150 Z",
  leftGlute: "M148 238 C132 236 120 246 116 262 C112 278 120 294 136 300 C146 297 150 286 150 270 Z",
  rightGlute: "M152 238 C168 236 180 246 184 262 C188 278 180 294 164 300 C154 297 150 286 150 270 Z",
  leftHamstring: "M148 300 L124 303 C117 313 116 346 119 382 C121 404 128 418 138 418 C146 414 150 396 150 372 Z",
  rightHamstring: "M152 300 L176 303 C183 313 184 346 181 382 C179 404 172 418 162 418 C154 414 150 396 150 372 Z",
  leftCalf: "M136 420 C126 421 119 438 118 468 C117 506 121 542 128 558 C136 565 144 560 146 548 C149 516 147 456 144 434 C143 425 141 420 136 420 Z",
  rightCalf: "M164 420 C174 421 181 438 182 468 C183 506 179 542 172 558 C164 565 156 560 154 548 C151 516 153 456 156 434 C157 425 159 420 164 420 Z",
  leftShoulderBlade: "M120 110 C105 114 96 128 95 146 C96 158 104 166 116 166 C126 158 132 140 132 121 C129 114 125 111 120 110 Z",
  rightShoulderBlade: "M180 110 C195 114 204 128 205 146 C204 158 196 166 184 166 C174 158 168 140 168 121 C171 114 175 111 180 110 Z",
}

const FRONT_SILHOUETTE = (
  <>
    <path d="M150 12 C129 12 116 28 116 48 C116 64 125 75 133 81 L133 98 L167 98 L167 81 C175 75 184 64 184 48 C184 28 171 12 150 12 Z" />
    <path d="M112 96 C150 86 188 96 188 96 L188 150 L178 214 C178 250 168 262 150 262 C132 262 122 250 122 214 L112 150 Z" />
    <path d="M120 98 C103 102 90 116 86 138 L77 232 C76 248 84 258 95 254 C100 244 102 232 104 220 L111 150 C113 126 117 110 124 102 Z" />
    <path d="M180 98 C197 102 210 116 214 138 L223 232 C224 248 216 258 205 254 C200 244 198 232 196 220 L189 150 C187 126 183 110 176 102 Z" />
    <ellipse cx={91} cy={262} rx={12} ry={17} />
    <ellipse cx={209} cy={262} rx={12} ry={17} />
    <path d="M118 250 C150 270 182 250 182 250 L178 310 C178 314 150 324 150 324 C150 324 122 314 122 310 Z" />
    <path d="M148 300 L120 303 C112 308 110 328 112 356 C114 430 118 510 125 556 C129 570 142 570 146 558 C150 520 150 460 150 398 Z" />
    <path d="M152 300 L180 303 C188 308 190 328 188 356 C186 430 182 510 175 556 C171 570 158 570 154 558 C150 520 150 460 150 398 Z" />
    <path d="M122 556 C118 568 117 582 118 590 C119 598 128 602 140 600 L150 598 L150 566 C150 560 140 556 130 556 Z" />
    <path d="M178 556 C182 568 183 582 182 590 C181 598 172 602 160 600 L150 598 L150 566 C150 560 160 556 170 556 Z" />
  </>
)

const BACK_SILHOUETTE = (
  <>
    <path d="M150 12 C129 12 116 28 116 48 C116 64 125 75 133 81 L133 98 L167 98 L167 81 C175 75 184 64 184 48 C184 28 171 12 150 12 Z" />
    <path d="M112 96 C150 86 188 96 188 96 L188 150 L178 214 C178 250 168 262 150 262 C132 262 122 250 122 214 L112 150 Z" />
    <path d="M118 98 C102 102 88 118 84 140 L76 232 C75 248 83 258 94 254 C99 244 101 232 103 220 L110 150 C112 126 116 110 124 102 Z" />
    <path d="M182 98 C198 102 212 118 216 140 L224 232 C225 248 217 258 206 254 C201 244 199 232 197 220 L190 150 C188 126 184 110 176 102 Z" />
    <ellipse cx={91} cy={262} rx={12} ry={17} />
    <ellipse cx={209} cy={262} rx={12} ry={17} />
    <path d="M118 250 C150 270 182 250 182 250 L178 310 C178 314 150 324 150 324 C150 324 122 314 122 310 Z" />
    <path d="M148 300 L120 303 C112 308 110 328 112 356 C114 430 118 510 125 556 C129 570 142 570 146 558 C150 520 150 460 150 398 Z" />
    <path d="M152 300 L180 303 C188 308 190 328 188 356 C186 430 182 510 175 556 C171 570 158 570 154 558 C150 520 150 460 150 398 Z" />
    <path d="M122 556 C118 568 117 582 118 590 C119 598 128 602 140 600 L150 598 L150 566 C150 560 140 556 130 556 Z" />
    <path d="M178 556 C182 568 183 582 182 590 C181 598 172 602 160 600 L150 598 L150 566 C150 560 160 556 170 556 Z" />
    {/* Posterior spine indicator */}
    <path d="M150 100 L150 248" stroke="#C2CBD6" strokeWidth={2} fill="none" />
  </>
)

const FRONT_ORDER = Object.keys(FRONT_PATHS) as RegionId[]
const BACK_ORDER = Object.keys(BACK_PATHS) as RegionId[]

type Props = {
  regions: Partial<Record<RegionId, RegionStatus>>
  selected: RegionId | null
  onSelect: (region: RegionId) => void
  view?: BodyView
}

export function BodyMap({ regions, selected, onSelect, view = "front" }: Props) {
  const [hovered, setHovered] = useState<{ region: RegionId; x: number; y: number } | null>(null)
  const [displayView, setDisplayView] = useState<BodyView>(view)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (view === displayView) return
    setFading(true)
    const timer = window.setTimeout(() => {
      setDisplayView(view)
      setFading(false)
    }, 180)
    return () => window.clearTimeout(timer)
  }, [view, displayView])

  const paths = displayView === "front" ? FRONT_PATHS : BACK_PATHS
  const order = displayView === "front" ? FRONT_ORDER : BACK_ORDER

  function statusOf(region: RegionId): RegionStatus {
    return regions[region] ?? "healthy"
  }

  return (
    <div className="relative flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4">
      <svg
        viewBox="0 0 300 620"
        className="h-[560px] w-auto transition-opacity duration-300 ease-in-out"
        style={{ opacity: fading ? 0 : 1 }}
        role="img"
        aria-label={`${displayView} anatomical body map`}
      >
        <g fill="#DCE3EC" stroke="#C2CBD6" strokeWidth={1.25} strokeLinejoin="round">
          {displayView === "front" ? FRONT_SILHOUETTE : BACK_SILHOUETTE}
        </g>

        {order.map((region) => {
          const status = statusOf(region)
          const isSelected = selected === region
          return (
            <path
              key={`${displayView}-${region}`}
              d={paths[region]}
              fill={STATUS_FILL[status]}
              stroke={STATUS_STROKE[status]}
              strokeWidth={isSelected ? 3 : 1.5}
              strokeLinejoin="round"
              className="cursor-pointer transition-[filter,stroke-width,fill] duration-200 hover:brightness-95 focus:outline-none"
              tabIndex={0}
              role="button"
              aria-label={`${REGION_LABELS[region]} - ${STATUS_LABELS[status]}`}
              onClick={() => onSelect(region)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelect(region)
                }
              }}
              onMouseEnter={(e) => {
                const wrap = e.currentTarget.ownerSVGElement?.parentElement?.getBoundingClientRect()
                if (wrap) setHovered({ region, x: e.clientX - wrap.left, y: e.clientY - wrap.top })
              }}
              onMouseMove={(e) => {
                const wrap = e.currentTarget.ownerSVGElement?.parentElement?.getBoundingClientRect()
                if (wrap) setHovered({ region, x: e.clientX - wrap.left, y: e.clientY - wrap.top })
              }}
              onMouseLeave={() => setHovered(null)}
            />
          )
        })}

        <g fill="none" stroke="#64748B" strokeOpacity={0.35} strokeWidth={1} strokeLinecap="round" pointerEvents="none">
          {displayView === "front" ? (
            <>
              <path d="M150 104 L150 156" />
              <path d="M150 168 L150 250" />
              <path d="M133 192 L167 192" />
              <path d="M132 214 L168 214" />
              <path d="M132 318 L130 384" />
              <path d="M168 318 L170 384" />
              <path d="M132 470 L131 552" />
              <path d="M168 470 L169 552" />
              <path d="M126 102 Q150 94 174 102" />
            </>
          ) : (
            <>
              <path d="M120 114 Q150 128 180 114" />
              <path d="M150 112 L150 236" />
              <path d="M128 168 Q150 180 172 168" />
              <path d="M134 248 Q150 258 166 248" />
              <path d="M136 316 L138 410" />
              <path d="M164 316 L162 410" />
              <path d="M136 438 L134 552" />
              <path d="M164 438 L166 552" />
            </>
          )}
        </g>
      </svg>

      {hovered && !fading && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-[#0F172A] px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{ left: hovered.x, top: hovered.y - 8 }}
        >
          <p className="font-medium">{REGION_LABELS[hovered.region]}</p>
          <p className="text-[#CBD5E1]">{STATUS_LABELS[statusOf(hovered.region)]}</p>
        </div>
      )}

      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
          <span className="text-muted-foreground">Healthy</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
          <span className="text-muted-foreground">Monitoring</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
          <span className="text-muted-foreground">Active Injury</span>
        </div>
      </div>
    </div>
  )
}
