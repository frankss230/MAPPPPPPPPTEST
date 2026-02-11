'use client'
import React, { useEffect, useMemo, useState, KeyboardEvent } from 'react'
import FormRange from 'react-bootstrap/FormRange'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

interface Props {
  /** รองรับการใช้รูปแบบเดิมได้: ถ้าไม่ส่ง value จะทำงานแบบ uncontrolled ด้วย defaultValue */
  defaultValue?: number
  typeClass?: 1 | 2
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number

  /** เพิ่มตัวเลือกใหม่ */
  mode?: 'slider' | 'input' | 'both'   // default: both (พิมพ์ + สไลด์)
  showSteppers?: boolean               // ปุ่ม +/- ข้างช่องพิมพ์
  disabled?: boolean
  decimals?: number                    // จำนวนทศนิยมที่แสดง/ปัด เช่น 1
  suffix?: React.ReactNode             // หน่วยท้ายอินพุต เช่น "°C"
  ariaLabel?: string
}

const RangeSlider = ({
  defaultValue = 1,
  typeClass = 1,
  value,
  onChange,
  min = 1,
  max = 20000,
  step = 1,

  mode = 'both',
  showSteppers = true,
  disabled = false,
  decimals,
  suffix,
  ariaLabel = 'numeric input',
}: Props) => {
  const stepDecimals = useMemo(() => decimals ?? getStepDecimals(step), [decimals, step])

  // รองรับทั้ง controlled (มี value) และ uncontrolled (ไม่มี value → ใช้ state ภายใน)
  const isControlled = value !== undefined
  const [innerValue, setInnerValue] = useState<number>(clamp(roundToStep(defaultValue, step, stepDecimals), min, max))
  const current = isControlled ? clamp(roundToStep(value as number, step, stepDecimals), min, max) : innerValue

  // sync ภายในเมื่อเป็น controlled
  useEffect(() => {
    if (isControlled) return
    // ถ้า min/max/step เปลี่ยน ให้ normalize ค่าใน state
    setInnerValue((v) => clamp(roundToStep(v, step, stepDecimals), min, max))
  }, [isControlled, min, max, step, stepDecimals])

  // ข้อความในช่องพิมพ์
  const [inputText, setInputText] = useState<string>(format(current, stepDecimals))
  useEffect(() => {
    setInputText(format(current, stepDecimals))
  }, [current, stepDecimals])

  const commit = (next: number) => {
    const clamped = clamp(roundToStep(next, step, stepDecimals), min, max)
    if (!isControlled) setInnerValue(clamped)
    onChange?.(clamped)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const txt = e.target.value
    setInputText(txt)
    const parsed = parseFloat(txt.replace(',', '.'))
    if (!Number.isNaN(parsed)) {
      const within = clamp(parsed, min, max)
      onChange?.(within)
      if (!isControlled) setInnerValue(within)
    }
  }

  const onInputBlur = () => {
    const parsed = parseFloat(inputText.replace(',', '.'))
    const next = Number.isNaN(parsed) ? current : parsed
    const normalized = clamp(roundToStep(next, step, stepDecimals), min, max)
    setInputText(format(normalized, stepDecimals))
    commit(normalized)
  }

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
  }

  const nudge = (delta: number) => commit(current + delta)

  return (
    <div className="d-flex flex-column gap-2">
      {(mode === 'slider' || mode === 'both') && (
        <FormRange
          disabled={disabled}
          className={typeClass === 1 ? 'range-slider-1' : 'range-slider-2'}
          value={current}
          onChange={(e) => commit(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          aria-label="range slider"
        />
      )}

      {(mode === 'input' || mode === 'both') && (
        <InputGroup>
          {showSteppers && (
            <Button
              variant="outline-secondary"
              onClick={() => nudge(-step)}
              disabled={disabled || current <= min}
              aria-label="decrease"
            >
              −
            </Button>
          )}
          <Form.Control
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            value={inputText}
            onChange={onInputChange}
            onBlur={onInputBlur}
            onKeyDown={onInputKey}
            disabled={disabled}
            aria-label={ariaLabel}
          />
          {showSteppers && (
            <Button
              variant="outline-secondary"
              onClick={() => nudge(step)}
              disabled={disabled || current >= max}
              aria-label="increase"
            >
              +
            </Button>
          )}
          {suffix != null && <InputGroup.Text>{suffix}</InputGroup.Text>}
        </InputGroup>
      )}
    </div>
  )
}

/** Utils */
function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}
function getStepDecimals(step: number) {
  const s = step.toString()
  const i = s.indexOf('.')
  return i >= 0 ? s.length - i - 1 : 0
}
function roundToStep(v: number, step: number, decimals: number) {
  const inv = 1 / step
  const rounded = Math.round(v * inv) / inv
  return Number(rounded.toFixed(decimals))
}
function format(v: number, decimals: number) {
  return decimals > 0 ? v.toFixed(decimals) : String(Math.round(v))
}

export default RangeSlider
