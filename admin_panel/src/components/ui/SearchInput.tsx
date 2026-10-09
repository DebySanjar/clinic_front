import styled from 'styled-components'
import { cn } from '@/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const StyledWrapper = styled.div<{ $fullWidth?: boolean }>`
  .search-wrap {
    position: relative;
    background: linear-gradient(135deg, rgb(179, 208, 253) 0%, rgb(164, 202, 248) 100%);
    border-radius: 1000px;
    padding: 6px;
    display: grid;
    place-content: center;
    z-index: 0;
    width: 100%;
  }

  .search-inner {
    position: relative;
    width: 100%;
    border-radius: 50px;
    background: linear-gradient(135deg, rgb(218, 232, 247) 0%, rgb(214, 229, 247) 100%);
    padding: 4px;
    display: flex;
    align-items: center;
  }

  .search-inner::before {
    content: "";
    width: 100%;
    height: 100%;
    border-radius: inherit;
    position: absolute;
    top: -1px;
    left: -1px;
    background: linear-gradient(0deg, rgb(218, 232, 247) 0%, rgb(255, 255, 255) 100%);
    z-index: -1;
  }

  .search-inner::after {
    content: "";
    width: 100%;
    height: 100%;
    border-radius: inherit;
    position: absolute;
    bottom: -1px;
    right: -1px;
    background: linear-gradient(0deg, rgb(163, 206, 255) 0%, rgb(211, 232, 255) 100%);
    box-shadow: rgba(79, 156, 232, 0.6) 2px 2px 4px 0px, rgba(79, 156, 232, 0.4) 4px 4px 14px 0px;
    z-index: -2;
  }

  .search-input {
    padding: 7px 12px;
    width: 100%;
    background: transparent;
    border: none;
    color: #2563eb;
    font-size: 14px;
    font-weight: 500;
    border-radius: 50px;
    font-family: 'Inter', sans-serif;
  }

  .search-input::placeholder {
    color: #93c5fd;
    font-weight: 400;
  }

  .search-input:focus {
    outline: none;
  }

  .search-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-left: 2px solid rgba(255,255,255,0.7);
    border-radius: 50%;
    padding: 8px;
    margin-right: 4px;
    cursor: pointer;
    transition: border-width 0.15s;
  }

  .search-icon:hover {
    border-left-width: 3px;
  }

  .search-icon path {
    fill: white;
  }

  .clear-btn {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    margin-right: 8px;
    border-radius: 50%;
    background: rgba(37, 99, 235, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s;
    border: none;
  }

  .clear-btn:hover {
    background: rgba(37, 99, 235, 0.3);
  }

  .clear-btn svg {
    width: 12px;
    height: 12px;
    stroke: #2563eb;
    stroke-width: 2.5;
  }
`

export function SearchInput({ value, onChange, placeholder = 'Qidirish...', className }: SearchInputProps) {
  return (
    <StyledWrapper>
      <div className={cn('search-wrap', className)}>
        <div className="search-inner">
          <input
            className="search-input"
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
          />
          {value && (
            <button className="clear-btn" onClick={() => onChange('')} type="button">
              <svg viewBox="0 0 24 24" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg viewBox="0 0 24 24" className="search-icon">
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
            </g>
          </svg>
        </div>
      </div>
    </StyledWrapper>
  )
}
